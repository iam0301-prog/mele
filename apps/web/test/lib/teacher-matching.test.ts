import { describe, expect, it } from 'vitest';
import {
  defaultMatchAnswers,
  rankTeacherMatches,
  scoreTeacherMatch,
  serializeMatchResults,
} from '@/lib/teacher-matching';
import type { Teacher, TeacherService } from '@/types/db';

const baseTeacher: Teacher = {
  id: 'teacher-1',
  user_id: 'user-1',
  status: 'active',
  display_name: '塔羅老師 A',
  avatar_url: null,
  title: '塔羅與感情諮詢',
  intro_short: '溫柔陪伴、清楚整理',
  intro_long: '專長感情、塔羅、自我探索',
  quote: null,
  specialties: ['塔羅', '感情', '自我探索'],
  consultation_style: '溫柔陪伴',
  line_url: null, instagram: null, facebook: null, threads: null, youtube: null, website: null,
  rating: 4.8,
  total_reviews: 25,
  cases_count: 80,
  commission_rate: 0.2,
  approved_at: '2026-01-01T00:00:00Z',
  paused_at: null, suspended_at: null, suspended_reason: null, admin_script: null,
  created_at: '2026-01-01T00:00:00Z',
};

const baseService: TeacherService = {
  id: 'service-1',
  teacher_id: 'teacher-1',
  name: '60 分鐘諮詢',
  description: null,
  duration_minutes: 60,
  price_ntd: 1500,
  is_active: true,
  display_order: 0,
};

describe('lib/teacher-matching', () => {
  describe('defaultMatchAnswers', () => {
    it('returns sane defaults', () => {
      const a = defaultMatchAnswers();
      expect(a.topic).toBe('love');
      expect(a.tool).toBe('tarot');
      expect(a.style).toBe('gentle');
      expect(a.duration).toBe(60);
    });
  });

  describe('scoreTeacherMatch', () => {
    it('rewards exact tool match (specialty)', () => {
      const result = scoreTeacherMatch(baseTeacher, [baseService], defaultMatchAnswers());
      expect(result.scoreParts.specialty).toBe(40);
      expect(result.score).toBeGreaterThanOrEqual(50);
      expect(result.service).toBe(baseService);
    });

    it('caps total score at 100', () => {
      const star: Teacher = { ...baseTeacher, rating: 5, total_reviews: 999, cases_count: 999 };
      const r = scoreTeacherMatch(star, [baseService], defaultMatchAnswers());
      expect(r.score).toBeLessThanOrEqual(100);
    });

    it('returns null service when teacher has no active service', () => {
      const inactiveService = { ...baseService, is_active: false };
      const r = scoreTeacherMatch(baseTeacher, [inactiveService], defaultMatchAnswers());
      expect(r.service).toBeNull();
      expect(r.scoreParts.price).toBe(0);
    });

    it('matches topic-related tool when answer is "unsure"', () => {
      const answers = { ...defaultMatchAnswers(), tool: 'unsure' as const, topic: 'love' as const };
      // 月澄專長有 "塔羅" → love 議題的 TOPIC_TOOLS 包含 tarot → exact 命中 = 40
      const r = scoreTeacherMatch(baseTeacher, [baseService], answers);
      expect(r.scoreParts.specialty).toBe(40);
    });

    it('produces 1-3 reasons', () => {
      const r = scoreTeacherMatch(baseTeacher, [baseService], defaultMatchAnswers());
      expect(r.reasons.length).toBeGreaterThan(0);
      expect(r.reasons.length).toBeLessThanOrEqual(3);
    });
  });

  describe('rankTeacherMatches', () => {
    it('sorts by score desc then rating desc', () => {
      const t2: Teacher = { ...baseTeacher, id: 'teacher-2', rating: 3.5, specialties: ['八字'] };
      const t3: Teacher = { ...baseTeacher, id: 'teacher-3', rating: 4.5, specialties: ['塔羅'], total_reviews: 5 };
      const services: TeacherService[] = [
        baseService,
        { ...baseService, id: 's2', teacher_id: 'teacher-2' },
        { ...baseService, id: 's3', teacher_id: 'teacher-3' },
      ];
      const ranked = rankTeacherMatches([baseTeacher, t2, t3], services, defaultMatchAnswers());
      expect(ranked).toHaveLength(3);
      expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score);
      expect(ranked[ranked.length - 1].teacher.id).toBe('teacher-2'); // 八字 vs love+tarot 最不相關
    });

    it('flags closest:true when best score < 70', () => {
      const weak: Teacher = { ...baseTeacher, specialties: [], intro_short: null, intro_long: null,
        rating: 0, total_reviews: 0, cases_count: 0, consultation_style: null };
      const ranked = rankTeacherMatches([weak], [baseService], defaultMatchAnswers());
      expect(ranked[0].score).toBeLessThan(70);
      expect(ranked[0].closest).toBe(true);
    });
  });

  describe('serializeMatchResults', () => {
    it('flattens to id + score + reasons', () => {
      const ranked = rankTeacherMatches([baseTeacher], [baseService], defaultMatchAnswers());
      const flat = serializeMatchResults(ranked);
      expect(flat[0]).toMatchObject({
        teacher_id: 'teacher-1',
        service_id: 'service-1',
        score: expect.any(Number),
        reasons: expect.any(Array),
      });
    });
  });
});
