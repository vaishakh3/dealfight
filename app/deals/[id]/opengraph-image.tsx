import { ImageResponse } from 'next/og';
import { getPublishedDeal } from '@/lib/published-listings';

export const alt = 'A deal fighting for the top spot on Deal Fight';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type ImageProps = {
  params: Promise<{ id: string }>;
};

export default async function Image({ params }: ImageProps) {
  const { id } = await params;
  const deal = await getPublishedDeal(id);
  const listing = deal?.listing;
  const rank = deal?.rank ?? '?';
  const name = listing?.name ?? 'Deal Fight';
  const label = listing?.dealLabel ?? 'A NEW DEAL';
  const price = listing?.dealPrice ?? 'See the board';
  const regularPrice = listing?.regularPrice ?? '';
  const initials = name.slice(0, 2).toUpperCase();

  return new ImageResponse(
    <div style={{ background: '#f4f0e5', color: '#10110f', display: 'flex', flexDirection: 'column', height: '100%', padding: '52px 58px', position: 'relative', width: '100%' }}>
      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ alignItems: 'center', display: 'flex', fontSize: 26, fontWeight: 900, letterSpacing: '-1px' }}>
          <div style={{ alignItems: 'center', background: '#ff4f23', border: '3px solid #10110f', borderRadius: 40, display: 'flex', height: 58, justifyContent: 'center', marginRight: 16, width: 58 }}>⚡</div>
          DEAL <span style={{ color: '#ff4f23' }}>FIGHT</span><span style={{ fontSize: 15, marginLeft: 3 }}>.LOL</span>
        </div>
        <div style={{ background: '#10110f', color: '#c8ff2e', display: 'flex', fontSize: 19, fontWeight: 800, padding: '13px 18px' }}>SPONSORED #{rank}</div>
      </div>

      <div style={{ display: 'flex', flex: 1, marginTop: 46 }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '53%' }}>
          <div style={{ alignItems: 'center', display: 'flex' }}>
            <div style={{ alignItems: 'center', background: '#10110f', color: '#fff', display: 'flex', fontSize: 28, fontWeight: 900, height: 78, justifyContent: 'center', marginRight: 22, width: 78 }}>{initials}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#66675f', fontSize: 16, fontWeight: 800 }}>CURRENTLY FIGHTING AT #{rank}</span>
              <span style={{ fontSize: 54, fontWeight: 950, letterSpacing: '-3px', lineHeight: 1 }}>{name}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 28, fontWeight: 750, lineHeight: 1.2, marginTop: 38 }}>
            <span>Brands compete for attention.</span>
            <span>You get the saving.</span>
          </div>
        </div>

        <div style={{ background: '#c8ff2e', border: '4px solid #10110f', boxShadow: '12px 12px 0 #10110f', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '38px 42px', transform: 'rotate(1deg)', width: '47%' }}>
          <span style={{ fontSize: 17, fontWeight: 900, letterSpacing: '2px' }}>THE SHOPPER OFFER</span>
          <strong style={{ fontSize: 72, fontWeight: 950, letterSpacing: '-4px', lineHeight: 1, marginTop: 18 }}>{label}</strong>
          <span style={{ fontSize: 34, fontWeight: 850, marginTop: 22 }}>{price}</span>
          {regularPrice ? <span style={{ color: '#52534d', fontSize: 20, marginTop: 7 }}>Regularly {regularPrice}</span> : null}
        </div>
      </div>

      <div style={{ alignItems: 'center', borderTop: '3px solid #10110f', display: 'flex', fontSize: 18, fontWeight: 850, justifyContent: 'space-between', paddingTop: 20 }}>
        <span>PAID RANK. REAL DEAL.</span><span>DEALFIGHT.LOL →</span>
      </div>
    </div>,
    size,
  );
}
