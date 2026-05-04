# Member Experience 100 Design

## Goal

Raise the current closed-beta consumer experience from a working prototype to a polished, repeatable member loop: understand a result, interact with it, spend points on meaningful unlocked content, and return daily.

## Scope

This phase targets the closed-beta product score, not full commercial launch readiness. Payment production hardening, legal review, and advanced professional algorithm validation remain release-gate work, but the consumer-facing member loop should feel complete.

## Product Requirements

- Every calculator result keeps the existing refined 2D visual presentation.
- Members see a clear point economy: current balance, daily 200 point claim, 100 point unlock cost, and unlocked state.
- Unlocking `deep_reading`, `transit_day`, `transit_month`, or `transit_year` reveals meaningful content immediately, not placeholder copy.
- Daily tarot/rune remains one choice per day.
- Account history shows member point status and recent unlock records so members feel their activity is saved.
- Copy must be clean Traditional Chinese in the browser.

## Architecture

Create a focused `member-unlocks` library that owns point constants, unlock options, scope keys, and generated unlocked reading copy. `ToolResult` renders the member panel and delegates all content generation to the library. `account/charts` becomes the member archive surface by loading wallet, unlock records, and chart history together.

## Validation

Add structure checks that require the member unlock library, non-placeholder unlock content, account wallet display, and unlock history UI. Existing type-check, SQL, Python API, and production build remain required before completion.
