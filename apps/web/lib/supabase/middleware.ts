import { NextResponse, type NextRequest } from 'next/server';

type ResponseFactory = (requestHeaders: Headers) => NextResponse;

function nextResponse(requestHeaders: Headers) {
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export async function updateSession(
  request: NextRequest,
  requestHeaders = request.headers,
  createResponse: ResponseFactory = nextResponse,
) {
  // Keep edge middleware focused on routing and locale headers. Supabase session
  // refresh is handled by page/server clients so production public pages do not
  // hard-fail if the edge runtime cannot initialize auth dependencies.
  return createResponse(requestHeaders);
}
