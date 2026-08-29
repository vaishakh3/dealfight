import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const alt = 'Deal Fight: Brands fight for the top. Shoppers get the discount.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const logoData = await readFile(
  join(process.cwd(), 'public/brand/dealfight-mark-512.png'),
  'base64',
);
const logoSrc = `data:image/png;base64,${logoData}`;

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: '#f6f3e9',
        color: '#10110f',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '42px 48px 38px',
        position: 'relative',
        width: '100%',
      }}
    >
      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ alignItems: 'center', display: 'flex' }}>
          <img alt="" src={logoSrc} style={{ height: 58, width: 58 }} />
          <div style={{ display: 'flex', fontSize: 27, fontWeight: 950, letterSpacing: '-1.5px', marginLeft: 14 }}>
            DEAL <span style={{ color: '#bd2c0d', marginLeft: 7 }}>FIGHT</span><span style={{ fontSize: 14, marginLeft: 3, marginTop: 3 }}>.LOL</span>
          </div>
        </div>
        <div style={{ background: '#10110f', color: '#ceff2e', display: 'flex', fontSize: 16, fontWeight: 900, letterSpacing: '1.5px', padding: '12px 17px' }}>
          THE LIVE DEAL BOARD
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, marginTop: 39 }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: 46, width: '60%' }}>
          <span style={{ color: '#bd2c0d', fontSize: 16, fontWeight: 900, letterSpacing: '2px' }}>TRANSPARENT SPONSORED RANKING</span>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 71, fontWeight: 950, letterSpacing: '-5px', lineHeight: 0.88, marginTop: 20 }}>
            <span>BRANDS FIGHT</span>
            <span>FOR THE TOP.</span>
            <span style={{ color: '#bd2c0d' }}>YOU SAVE.</span>
          </div>
          <span style={{ fontSize: 22, fontWeight: 650, lineHeight: 1.3, marginTop: 28, maxWidth: 590 }}>
            Sponsor bids decide rank. The deal you get stays clear and separate.
          </span>
        </div>

        <div style={{ alignItems: 'stretch', display: 'flex', justifyContent: 'center', width: '40%' }}>
          <div style={{ background: '#fffef8', border: '3px solid #10110f', boxShadow: '12px 12px 0 #10110f', display: 'flex', flex: 1, flexDirection: 'column', transform: 'rotate(1deg)' }}>
            <div style={{ alignItems: 'center', borderBottom: '3px solid #10110f', display: 'flex', justifyContent: 'space-between', padding: '18px 22px' }}>
              <span style={{ fontSize: 33, fontWeight: 950 }}>#1</span>
              <span style={{ background: '#1958f0', color: '#ffffff', display: 'flex', fontSize: 13, fontWeight: 900, letterSpacing: '1px', padding: '8px 10px' }}>SPONSORED</span>
            </div>
            <div style={{ background: '#ceff2e', display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', padding: '26px 25px' }}>
              <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: '1.6px' }}>THE SHOPPER OFFER</span>
              <strong style={{ fontSize: 68, fontWeight: 950, letterSpacing: '-4px', lineHeight: 0.95, marginTop: 14 }}>70% OFF</strong>
              <span style={{ fontSize: 17, fontWeight: 750, marginTop: 17 }}>The saving is never the bid.</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ alignItems: 'center', borderTop: '2px solid #10110f', display: 'flex', fontSize: 16, fontWeight: 900, justifyContent: 'space-between', letterSpacing: '1px', paddingTop: 18 }}>
        <span>PAID RANK. REAL DEAL.</span>
        <span style={{ color: '#bd2c0d' }}>DEALFIGHT.LOL →</span>
      </div>
    </div>,
    size,
  );
}
