import React from 'react';
import QRCode from 'react-qr-code';

interface PosterTemplateProps {
  shopName: string;
  shopId: string;
  qrValue: string;
  id?: string;
}

const PosterTemplate: React.FC<PosterTemplateProps> = ({
  shopName,
  shopId,
  qrValue,
  id,
}) => {
  // Brand color purple (#5D2CA8) matching the reference image exactly
  const brandPurple = '#5D2CA8';

  // Construct dynamic QR code URL fallback if not provided
  const qrCodeUrl = qrValue || (shopId ? `https://print-smart-18.vercel.app/?shopId=${shopId}` : 'https://print-smart-18.vercel.app/?shopId=7U-6257');

  const steps = [
    { num: 1, title: 'SCAN', desc: 'Scan the QR code' },
    { num: 2, title: 'UPLOAD', desc: 'Upload your files' },
    { num: 3, title: 'ORDER', desc: 'Choose options & place order' },
    { num: 4, title: 'SCRATCH & WIN', desc: 'Scratch coupon & get rewards' },
  ];

  return (
    <div
      id={id || "printsmart-qr-poster"}
      style={{
        width: '2480px',
        height: '3508px',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
        padding: '120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Outer thin border running along the edge of the poster, just inside the page margins */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
          bottom: '60px',
          left: '60px',
          right: '60px',
          border: `8px solid ${brandPurple}`,
          pointerEvents: 'none',
          boxSizing: 'border-box',
        }}
      />

      {/* Main Container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}
      >
        {/* Header Section */}
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            width: '100%',
            marginTop: '40px' 
          }}
        >
          {/* Shop Name */}
          <h1
            style={{
              color: brandPurple,
              fontSize: '180px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              textAlign: 'center',
              margin: 0,
              lineHeight: '1.1',
            }}
          >
            {shopName || 'ABC SHOP'}
          </h1>

          {/* Underline below Shop Name */}
          <div
            style={{
              width: '1350px',
              height: '6px',
              backgroundColor: brandPurple,
              marginTop: '45px',
              marginBottom: '45px',
            }}
          />

          {/* Subtitle */}
          <h2
            style={{
              color: '#1A1A1A',
              fontSize: '95px',
              fontWeight: 700,
              textAlign: 'center',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Scan QR to Upload
          </h2>
        </div>

        {/* QR Code Container */}
        <div
          style={{
            position: 'relative',
            width: '1080px',
            height: '1080px',
            border: `10px solid ${brandPurple}`,
            borderRadius: '60px',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '90px',
            boxSizing: 'border-box',
            marginTop: '50px',
            marginBottom: '50px',
          }}
        >
          {/* QR Code */}
          {qrCodeUrl ? (
            <QRCode
              value={qrCodeUrl}
              size={880}
              level="Q"
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            />
          ) : (
            <div 
              style={{ 
                width: '880px', 
                height: '880px', 
                backgroundColor: '#F1F5F9' 
              }} 
              className="animate-pulse" 
            />
          )}

          {/* Overlapping Badge at the bottom center of the QR box */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translate(-50%, 50%)',
              backgroundColor: brandPurple,
              borderRadius: '35px',
              padding: '24px 75px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
              boxShadow: '0 10px 25px -5px rgba(93, 44, 168, 0.3)',
            }}
          >
            <span
              style={{
                color: '#FFFFFF',
                fontSize: '56px',
                fontWeight: 800,
              }}
            >
              Shop ID: {shopId || '7U-6257'}
            </span>
          </div>
        </div>

        {/* Steps section header with lines flanking on both sides */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1850px',
            marginTop: '80px',
            marginBottom: '60px',
          }}
        >
          <div style={{ flex: 1, height: '6px', backgroundColor: brandPurple }} />
          <span
            style={{
              color: brandPurple,
              fontSize: '65px',
              fontWeight: 800,
              textTransform: 'uppercase',
              paddingLeft: '50px',
              paddingRight: '50px',
              letterSpacing: '0.08em',
            }}
          >
            4 Simple Steps
          </span>
          <div style={{ flex: 1, height: '6px', backgroundColor: brandPurple }} />
        </div>

        {/* Stacked Vertical Steps */}
        <div 
          style={{ 
            width: '1850px', 
            display: 'flex', 
            flexDirection: 'column' 
          }}
        >
          {steps.map((step, idx) => (
            <div 
              key={step.num} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                width: '100%' 
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingTop: '35px',
                  paddingBottom: '35px',
                  boxSizing: 'border-box',
                }}
              >
                {/* Number Circle */}
                <div
                  style={{
                    width: '130px',
                    height: '130px',
                    borderRadius: '50%',
                    backgroundColor: brandPurple,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span 
                    style={{ 
                      color: '#FFFFFF', 
                      fontSize: '70px', 
                      fontWeight: 900 
                    }}
                  >
                    {step.num}
                  </span>
                </div>

                {/* Vertical Divider Line */}
                <div
                  style={{
                    width: '4px',
                    height: '100px',
                    backgroundColor: '#CBD5E1', // slate-300
                    marginLeft: '50px',
                    marginRight: '50px',
                  }}
                />

                {/* Text Content */}
                <div 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center' 
                  }}
                >
                  <h3
                    style={{
                      color: '#1A1A1A',
                      fontSize: '55px',
                      fontWeight: 800,
                      margin: 0,
                      textTransform: 'uppercase',
                      lineHeight: '1.2',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      color: '#475569', // slate-600
                      fontSize: '42px',
                      fontWeight: 500,
                      margin: '8px 0 0 0',
                      lineHeight: '1.2',
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Horizontal Divider Line */}
              {idx < 3 ? (
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: '#E2E8F0', // slate-200
                    marginTop: '15px',
                    marginBottom: '15px',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: brandPurple, // bottom divider under step 4 is purple
                    marginTop: '15px',
                    marginBottom: '15px',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            marginTop: '50px',
            marginBottom: '40px',
          }}
        >
          <span
            style={{
              color: '#1E293B',
              fontSize: '50px',
              fontWeight: 500,
            }}
          >
            by{' '}
            <span
              style={{
                color: '#1E293B',
                fontWeight: 800,
              }}
            >
              PrintSmart
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PosterTemplate;
