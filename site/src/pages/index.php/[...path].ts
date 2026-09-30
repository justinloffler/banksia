import type { APIRoute } from 'astro';

export const prerender = false;

/** Old CMS pages (index.php/selectedContent/<id>) and where they live now. */
const LEGACY_PAGES: Record<string, string> = {
  '1421035056': '/',
  '1163092997': '/about/',
  '63353039': '/terms/',
  '974690243': '/coaches-drivers/',
  '1918768925': '/charters/',
  '432184977': '/charters/#groups',
  '904669671': '/travel-club/',
  '1910560607': '/camping-safaris/',
  '1783989715': '/group-tours/',
  '2022761914': '/coaches-drivers/#express',
  '284480115': '/contact/',
};

/** Permanently redirect any old /index.php address to its new page. */
export const GET: APIRoute = ({ params, redirect }) => {
  const id = params.path?.match(/selectedContent\/(\d+)/i)?.[1];
  return redirect((id && LEGACY_PAGES[id]) || '/', 301);
};
