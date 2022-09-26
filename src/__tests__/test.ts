import { ParseCNFT } from '../index';
import { MetadataErrors, NftTypes } from '../types';

describe('JSON tests', () => {
  it('Invalid json throws json error', () => {
    const { error } = ParseCNFT('{');
    expect(error?.type).toBe(MetadataErrors.json);
  });

  it('Empty json throws missing metadatum error', () => {
    const { error } = ParseCNFT('{}');
    expect(error?.type).toBe(MetadataErrors.cip25);
  });

  it('Unexpected token at pos 67', () => {
    const { error } = ParseCNFT('{"721":{"ba3afde69bb939ae4439c36d220e6b2686c6d3091bbc763ac0a1679c":}}');
    expect(error?.type).toBe(MetadataErrors.json);
    expect(error?.message).toBe("Unexpected token } in JSON at position 67");
  });

  it('Invalid comma (after "TestProject")', () => {
    const { error } = ParseCNFT(
      `{
        "721": {
            "ba3afde69bb939ae4439c36d220e6b2686c6d3091bbc763ac0a1679c": {
                "Test0": {
                    "image": "ipfs://QmQJfWDun8h6ucvLpm7Z15zNbW3tBCUsgXpkZ8ETCisgm9",
                    "mediaType": "image/svg",
                    "name": "Albert the absurd",
                    "project": "TestProject",
                }
            }
        }
      }`
    );
    expect(error?.type).toBe(MetadataErrors.json);
    expect(error?.message).toBe("Unexpected token } in JSON at position 363");
  });
});

describe('NFT 721 tag tests', () => {
  it('Valid 721 tag', () => {
    const mockedNFT = {
      '721': {
        ba3afde69bb939ae4439c36d220e6b2686c6d3091bbc763ac0a1679c: {
          'bit_bot 0x0000': {
            image: 'ipfs://QmQJfWDun8h6ucvLpm7Z15zNbW3tBCUsgXpkZ8ETCisgm9',
            mediaType: 'image/svg',
            name: 'bit_bot 0x0000',
            project: 'bit_bots'
          },
        },
      },
    };
    const { error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error).toBeNull();
  });

  it('Non 721 metadatum tag throws CIP error', () => {
    const mockedNFT = {
      '42': {
        ba3afde69bb939ae4439c36d220e6b2686c6d3091bbc763ac0a1679c: {
          'bit_bot 0x0000': {
            image: 'ipfs://QmQJfWDun8h6ucvLpm7Z15zNbW3tBCUsgXpkZ8ETCisgm9',
            mediaType: 'image/svg',
            name: 'bit_bot 0x0000',
            project: 'bit_bots',
          },
        },
      },
    };
    const { error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error?.type).toBe(MetadataErrors.cip25);
  });
});

describe('Error checks', () => {
  it('Invalid image array lengths', () => {
    const mockedNFT = {
      '721': {
        '4bfa713fc28cdd2d5e2adb518ef1265f715e39ee5af0f7be14bfa8bf': {
          CTB02067: {
            image: [
              'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcma',
              'cvMjAwMC9zdmciIHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4Ij48Y2lyY2xlIGN4PSa',
            ],
            mediaType: 'image/svg+xml',
            name: 'CardanoTrees Bonsai 02067',
          },
        },
      },
    };
    const { error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error?.type).toBe(MetadataErrors.cip25);
  });

  it('onchain tag check', () => {
    const mockedNFT = {
      '721': {
        ba3afde69bb939ae4439c36d220e6b2686c6d3091bbc763ac0a1679c: {
          test: {
            image: 'ipfs://QmQJfWDun8h6ucvLpm7Z15zNbW3tBCUsgXpkZ8ETCisgm9',
            mediaType: 'image/svg',
            name: 'test',
            project: 'bit_bots',
          },
        },
      },
    };
    const { data } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(data?.assets[0]?.nftType).toBe(NftTypes.ipfs);
  });
});

describe('Existing nft project tests', () => {
  it('ada handle', () => {
    const mockedNFT = {
      '721': {
        f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a: {
          ada9000: {
            augmentations: [],
            core: {
              handleEncoding: 'utf-8',
              og: 0,
              prefix: '$',
              termsofuse: 'https://adahandle.com/tou',
              version: 0,
            },
            description: 'The Handle Standard',
            image: 'ipfs://QmaZ56m6ScGyzpYnGdSbp3z6jkMU7UZSuy7Azjnw8gzQMm',
            name: '$ada9000',
            website: 'https://adahandle.com',
          },
        },
      },
    };
    const { data, error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error).toBeNull();
    expect(data?.policyId).toBe('f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a');
    if (data?.assets) {
      expect(data?.assets[0]).toBeDefined();
      expect(data?.assets[0]?.assetName).toBe('ada9000');
      expect(data?.assets[0]?.name).toBe('$ada9000');
      expect(data?.assets[0]?.image).toBe('ipfs://QmaZ56m6ScGyzpYnGdSbp3z6jkMU7UZSuy7Azjnw8gzQMm');
      expect(data?.assets[0]?.other?.website).toBe('https://adahandle.com');
      expect(data?.assets[0]?.other?.name).toBeUndefined();
      expect(data?.assets[0].nftType).toBe(NftTypes.ipfs);
    } else {
      throw new Error('Undefined assset');
    }
  });

  it('CardanoTrees Bonsai', () => {
    const mockedNFT = {
      '721': {
        '4bfa713fc28cdd2d5e2adb518ef1265f715e39ee5af0f7be14bfa8bf': {
          CTB02067: {
            BackgroundColor: 'silver / orange red',
            FinalSizeInTheYear: '2024',
            FlowersColor: 'indigo / violet',
            FruitsColor: 'yellow',
            Hemisphere: 'N',
            LeavesColor: 'cyan',
            LeavesStyle: 'Junihitoe',
            PotColor: 'chocolate',
            PotStyle: 'Kobe',
            Style: 'Formal Upright',
            TrunkColor: 'yellow',
            description: 'CardanoTrees Bonsai Collection',
            files: [
              {
                mediaType: 'text/html',
                name: 'CardanoTrees Bonsai 02067',
                src: [
                  'data:text/html,<html><style>*{margin:0;padding:0;}html,%20body%2',
                  '0{width:100%;height:100%;}myCanvas%20{display:block;}</style><bo',
                  "dy%20style='background-color:black;'><section><div%20id='canvase",
                  "sdiv'%20style='position:relative;%20width:100%;%20height:100%'><",
                  "canvas%20id='layer1'%20style='z-index:1;position:absolute;left:0",
                  "px;top:0px;'></canvas><canvas%20id='layer2'%20style='z-index:2;p",
                  "osition:absolute;left:0px;top:0px;'></canvas><canvas%20id='layer",
                  "3'%20style='z-index:3;position:absolute;left:0px;top:0px;'></can",
                  "vas></div><script>CTB02067CB1=['rgb(116,91,16)'];CTB02067CB2=['r",
                  "gb(228,188,64)'];CTB02067cs=['rgb(0,255,255)'];CTB02067cfr=['rgb",
                  "(255,255,0)'];CTB02067cf1=['rgb(75,0,130)'];CTB02067cf2=['rgb(23",
                  "8,130,238)'];CTB02067age0=1.33212254226717;CTB02067pos=[0];CTB02",
                  '067par=[[15,5,0,Math.PI/3,0.0,[5,19,28,34],[0.4,0.35,0.2,0.15],[',
                  '-1,1,-1,1],0]];CTB02067S=[1];CTB02067seed=6;CTB02067dx=30;CTB020',
                  '67dy=140;CTB02067pfr=0.75;CTB02067ps=0.7;CTB02067pfl=0.75;shMC=[',
                  '1,1,0,1,1,1,1,1,1,1,1,1,1];shL=[.25,0,0,1,1,1,1,1,1,.5,.5,.5,.25',
                  '];shF=[0,0,0,0,0,0,1,1,1,0,0,0,0];shFl=[0,0,0,1,1,1,0,0,0,0,0,0,',
                  '0];shD=[1,.5,.5,1,1,1,1,1,1,1,1,1,1];mesc=2;function%20F(tt,sh,T',
                  '){var%20aa=tt/T;aa=(aa-Math.floor(aa))*12;var%20i=Math.floor(aa)',
                  ';var%20v=(sh[i+1]-sh[i])*(aa-i)+sh[i];return%20v}Math.CTB02067se',
                  'ed=function(s){var%20mask=4294967295,m_w=123456789+s&mask,m_z=98',
                  '7654321-s&mask;return%20function(){m_z=36969*(m_z&65535)+(m_z>>>',
                  '16)&mask;m_w=18e3*(m_w&65535)+(m_w>>>16)&mask;var%20result=(m_z<',
                  '<16)+(m_w&65535)>>>0;result/=4294967296;return%20result}};functi',
                  'on%20CTB02067ir(){for(var%20i=0;i<15e3;i++){var%20rr=CTB02067ran',
                  'd(0,1);CTB02067rav.push(rr)}}function%20CTB02067mr(i0){for(var%2',
                  '0i=i0;i<15e3;i++){var%20rr=CTB02067rand(0,1);CTB02067rav[i]=rr}}',
                  'function%20ri(){for(var%20i=0;i<100;i++){var%20xx=CTB02067rand(-',
                  '.5,.5),yy=CTB02067rand(-1,0),rr=CTB02067rand(2/700,5/700);fl.pus',
                  'h({x:xx,y:yy,r:rr})}}var%20ss;function%20ci(x,y,r1,r2,c,ang){CTB',
                  '02067ctx3.beginPath();CTB02067ctx3.fillStyle=c;CTB02067ctx3.elli',
                  'pse(x,y,r1,r2,ang,0,2*Math.PI);CTB02067ctx3.fill()}function%20CT',
                  'B02067rand(min,max){return%20CTB02067random()*(max-min)+min};fun',
                  'ction%20CTB02067I1(){};function%20CTB02067D1(px,py,sx,sy){let%20',
                  "C1='rgb(192,192,192)',C2='rgb(255,69,0)';ssx=window.innerWidth;s",
                  'sy=window.innerHeight;ss=Math.min(ssx,ssy);CTB02067ctx1.translat',
                  'e(ssx*px,ssy*py);CTB02067ctx1.scale(sx,sy);CTB02067ctx1.beginPat',
                  "h();CTB02067ctx1.fillStyle='white';CTB02067ctx1.arc(0,0,ss*0.45,",
                  '0,Math.PI*2);CTB02067ctx1.fill();CTB02067ctx1.beginPath();CTB020',
                  '67ctx1.fillStyle=C1;CTB02067ctx1.arc(ss/8,-ss/8,ss*0.15,0,Math.P',
                  'I*2);CTB02067ctx1.fill();CTB02067ctx1.strokeStyle=C2;CTB02067ctx',
                  "1.lineWidth=ss/450;CTB02067ctx1.lineCap='round';for(let%20i=0;%2",
                  '0i<30;%20i++){var%20ri=ss*0.4,dr=ss/450*0.8;CTB02067ctx1.beginPa',
                  'th();CTB02067ctx1.arc(0,0,ri-dr*i,0+Math.random(),Math.PI*6/4-Ma',
                  'th.random());CTB02067ctx1.stroke();};CTB02067ctx1.setTransform(1',
                  ',0,0,1,0,0);};function%20CTB02067I2(){CTB02067random=Math.CTB020',
                  '67seed(CTB02067seed);CTB02067random=Math.CTB02067seed(CTB02067se',
                  'ed);CTB02067rav=[];CTB02067ir();if(shMC[2]==0){shL=[.25,0,0,1,1,',
                  '1,1,1,1,.5,.5,.5,.25];shF=[0,0,0,0,0,0,1,1,1,0,0,0,0];shFl=[0,0,',
                  '0,1,1,1,0,0,0,0,0,0,0];shD=[1,.5,.5,1,1,1,1,1,1,1,1,1,1];mesc=2}',
                  'else{shL=[1,1,1,.5,.5,.5,.25,0,0,1,1,1,1];shF=[1,1,1,0,0,0,0,0,0',
                  ',0,0,0,1];shFl=[0,0,0,0,0,0,0,0,0,1,1,1,0];shD=[1,1,1,1,1,1,1,.5',
                  ',.5,1,1,1,1];mesc=8}};function%20CTB02067D2(xp,yp,sx,sy){ssx=win',
                  'dow.innerWidth;ssy=window.innerHeight;ss=Math.min(ssx,ssy);CTB02',
                  '067ctx2.clearRect(0,0,ssx,ssy);t=(Date.now()-1654469304118)/1e3;',
                  'd=new%20Date(Date.now());m=d.getUTCMonth();day=d.getUTCDate();h=',
                  'd.getUTCHours();year=d.getUTCFullYear();dia=m*30+day+h/24;CTB020',
                  '67ctx2.translate(WIDTH*.5+(xp-.5)*ss,HEIGHT*.5+(yp-.5)*ss);CTB02',
                  '067ctx2.scale(sx,sy);CTB02067age=CTB02067age0+t/3600/24/365/10;C',
                  'TB02067age=Math.min(CTB02067age,1.5);CTB02067ctx2.scale(CTB02067',
                  'age,CTB02067age);CTB02067ctx2.scale(.6,.3);function%20MT(Lp,P,A,',
                  'Ao,I,pos,esc,sig,NA){let%20L=Lp*ss/700;mp=P*Math.PI;ma=A*ss/900;',
                  'ymax=-L*(69+1);let%20alfa0=Ao;for(let%20i=0;i<35;i++){yi=-L*i;yf',
                  '=-L*(i+1);xi=Math.sin(yi/ymax*mp+alfa0)*ma+i*L*I;xf=Math.sin(yf/',
                  'ymax*mp+alfa0)*ma+(i+1)*L*I;wl=(30-i*.5)*ss/700;li(xi,yi,xf,yf,w',
                  'l*(CTB02067rav[i]/5+.7),CTB02067CB2[NA]);let%20dx=xf-xi,dy=yf-yi',
                  ',m=Math.sqrt(dx*dx+dy*dy);dx=dx/m;dy=dy/m;li(xi-wl/2*-dy,yi-wl/2',
                  '*dx,xf-wl/2*-dy,yf-wl/2*dx,wl*(CTB02067rav[i]/5+.7),CTB02067CB1[',
                  'NA])}for(let%20i=0;i<35;i++){yi=-L*i;yf=-L*(i+1);xi=Math.sin(yi/',
                  'ymax*mp+alfa0)*ma+i*L*I;xf=Math.sin(yf/ymax*mp+alfa0)*ma+(i+1)*L',
                  '*I;for(let%20j=0;j<pos.length;j++){if(i==pos[j]){CTB02067ctx2.tr',
                  'anslate(xf,yf);CTB02067ctx2.scale(-sig[j]*esc[j],esc[j]);ii=0;Tr',
                  'ee(-sig[j],1,NA);CTB02067ctx2.scale(-sig[j]/esc[j],1/esc[j]);CTB',
                  '02067ctx2.translate(-xf,-yf)}}}}for(let%20i=0;i<CTB02067pos.leng',
                  'th;i++){let%20par=CTB02067par[i];CTB02067ctx2.translate(CTB02067',
                  'pos[i]*30*ss/700,0);MT(par[0],par[1],par[2],par[3],par[4],par[5]',
                  ',par[6],par[7],par[8]);CTB02067ctx2.translate(-CTB02067pos[i]*30',
                  '*ss/700,0)}CTB02067ctx2.setTransform(1,0,0,1,0,0);function%20Tre',
                  'e(sig,ff,NA){bC=0;CTB02067random=Math.CTB02067seed(CTB02067seed)',
                  ';Branch2(CTB02067dx*ss/700,CTB02067dy*ss/700,10*ss/700,Math.PI/2',
                  ',1,0,sig,ff,NA)}function%20leaves(xo,yo,Lo,col){CTB02067ctx2.str',
                  "okeStyle='gray';CTB02067ctx2.fillStyle=col;CTB02067ctx2.lineWidt",
                  'h=ss/970;CTB02067ctx2.translate(xo,yo);CTB02067ctx2.rotate(Math.',
                  'PI);for(var%20i=0;i<5;i++){CTB02067ctx2.rotate(-3.9/2+i*3.9/6);L',
                  'L=Lo;if(i==0||i==4){LL=Lo*.65}if(i==1||i==3){LL=Lo*.8}CTB02067ct',
                  'x2.beginPath();CTB02067ctx2.moveTo(0,0);CTB02067ctx2.bezierCurve',
                  'To(-LL/6,LL/2,-LL/6,LL/2,0,LL);CTB02067ctx2.lineTo(0,0);CTB02067',
                  'ctx2.fill();CTB02067ctx2.stroke();CTB02067ctx2.beginPath();CTB02',
                  '067ctx2.moveTo(0,0);CTB02067ctx2.bezierCurveTo(LL/6,LL/2,LL/6,LL',
                  '/2,0,LL);CTB02067ctx2.lineTo(0,0);CTB02067ctx2.fill();CTB02067ct',
                  'x2.stroke();CTB02067ctx2.rotate(+3.9/2-i*3.9/6)}CTB02067ctx2.rot',
                  'ate(-Math.PI);CTB02067ctx2.translate(-xo,-yo)}function%20ci(x,y,',
                  'r1,r2,c,ang){CTB02067ctx2.beginPath();CTB02067ctx2.fillStyle=c;C',
                  'TB02067ctx2.ellipse(x,y,r1,r2,ang,0,2*Math.PI);CTB02067ctx2.fill',
                  "();CTB02067ctx2.lineWidth=ss/970;CTB02067ctx2.strokeStyle='black",
                  "';CTB02067ctx2.stroke()}function%20li(x0,y0,x1,y1,sw,c){CTB02067",
                  'ctx2.beginPath();CTB02067ctx2.lineWidth=sw;CTB02067ctx2.lineCap=',
                  "'round';CTB02067ctx2.strokeStyle=c;CTB02067ctx2.moveTo(x0,y0);CT",
                  'B02067ctx2.lineTo(x1,y1);CTB02067ctx2.stroke()}function%20fwr(x,',
                  'y,r1,r2,c1,c2){ci(x-r1,y,r1,r2,c1,0);ci(x+r1,y,r1,r2,c1,0);ci(x,',
                  'y-r2,r1,r2,c1,0);ci(x,y+r2,r1,r2,c1,0);ci(x,y,r1/2,r2/2,c2,0)}fu',
                  'nction%20Branch2(x0,y0,length,angle,branch,depth,sig,ff,NA){Co=3',
                  '0,maxDepth=50;MC=3e3;bC++;if(bC==Co){seed2=CTB02067seed*2023;CTB',
                  '02067random=Math.CTB02067seed(seed2);CTB02067mr(ii)}if(bC>MC){re',
                  'turn}if(depth>maxDepth){return}var%20x1=x0+length*Math.cos(angle',
                  '),y1=y0-length*Math.sin(angle);var%20d=depth/maxDepth,sw=.7+80*M',
                  'ath.pow(1-d,2.4)*(F(dia,shD,365)*.7+.4)*ss/700,rA=.7,fA=.3;if(ff',
                  '==0){fA=.1}var%20rfr=F(dia,shF,365)*5*ss/700;var%20rfl=F(dia,shF',
                  'l,365)*5*ss/700;var%20rl=F(dia,shL,365)*5*ss/700;var%20pa=Math.p',
                  'ow(d,.5);rA*=pa;fA*=pa;length*=CTB02067rav[ii]*.1+.95;ii++;if(ff',
                  '>0){if(CTB02067S[NA]==1||CTB02067S[NA]==2){if(depth>35){if(CTB02',
                  '067rav[ii]>CTB02067pfr){ci(x0,y0+rfr*3,rfr*3,rfr*3,CTB02067cfr[N',
                  'A],0)}}}ii++;if(CTB02067S[NA]==0){if(depth>45){if(CTB02067rav[ii',
                  ']>CTB02067ps){ci(x0,y0+20*rl,rl,rl*20,CTB02067cs[NA],0)}}ii++}if',
                  '(CTB02067S[NA]==1){if(depth>25){if(CTB02067rav[ii]>CTB02067ps){c',
                  'i(x0,y0+2*rl,rl,rl*2,CTB02067cs[NA],0)}}ii++}if(CTB02067S[NA]==2',
                  '){if(depth>45){if(CTB02067rav[ii]>CTB02067ps+.2){leaves(x0,y0,rl',
                  '*20,CTB02067cs[NA])}}ii++}if(CTB02067S[NA]==1){if(depth>35){if(C',
                  'TB02067rav[ii]>CTB02067pfl){fwr(x0,y0+4*rfl,rfl*1.2,rfl*2.4,CTB0',
                  '2067cf1[NA],CTB02067cf2[NA])}}}ii++}else{ii++;ii++;ii++}angle=an',
                  'gle+.005*Math.sin(branch*t/5+branch)*sig;if(depth>15){if(sig>=0)',
                  '{li(x0,y0,x1,y1,sw,CTB02067CB2[NA]);li(x0-sw/2,y0,x1-sw/2,y1,sw,',
                  'CTB02067CB1[NA])}else{li(x0,y0,x1,y1,sw,CTB02067CB1[NA]);li(x0-s',
                  'w/2,y0,x1-sw/2,y1,sw,CTB02067CB2[NA])}}if(CTB02067rav[ii]>.85&&d',
                  'epth>5){Branch2(x1,y1,length,angle-fA,branch+1,depth+1,sig,ff,NA',
                  ');Branch2(x1,y1,length,angle+fA,branch+1,depth+1,sig,ff,NA);ii++',
                  '}else{ii++;Branch2(x1,y1,length,angle+CTB02067rav[ii]*2*rA-rA,br',
                  'anch,depth+1,sig,ff,NA);ii++}}setTimeout(function(){window.reque',
                  'stAnimationFrame(function(){CTB02067D2(xp,yp,sx,sy)})},16)};func',
                  'tion%20CTB02067I3(){};function%20CTB02067D3(posxp,posyp,sxp,syp)',
                  '{ssx=window.innerWidth;ssy=window.innerHeight;ss=Math.min(ssx,ss',
                  "y);let%20c1='white',c2='rgb(210,105,30)';let%20mx=ss/4,my=ss/10,",
                  'b=ss/900*15,D=mx/4;CTB02067ctx3.translate(ssx*0.5+(posxp-0.5)*ss',
                  ',ssy*0.5+(posyp-0.5)*ss);CTB02067ctx3.scale(sxp,syp);function%20',
                  'gr(y1,y2,c1,c2){var%20mg=CTB02067ctx3.createLinearGradient(0,y1,',
                  '0,y2);mg.addColorStop(0,c1);mg.addColorStop(1,c2);return%20mg;};',
                  "CTB02067ctx3.fillStyle='rgb(235,236,240';CTB02067ctx3.beginPath(",
                  ');CTB02067ctx3.ellipse(0,my+b/2,mx/2,b/2,0,0,Math.PI*2);CTB02067',
                  "ctx3.fill();CTB02067ctx3.strokeStyle=gr(my-b,my+b,c1,'black');CT",
                  'B02067ctx3.beginPath();CTB02067ctx3.lineWidth=b;CTB02067ctx3.lin',
                  "eCap='round';CTB02067ctx3.moveTo(-mx/3,my);CTB02067ctx3.lineTo(-",
                  'mx/4,my);CTB02067ctx3.stroke();CTB02067ctx3.beginPath();CTB02067',
                  "ctx3.lineWidth=b;CTB02067ctx3.lineCap='round';CTB02067ctx3.moveT",
                  'o(mx/3,my);CTB02067ctx3.lineTo(mx/4,my);CTB02067ctx3.stroke();CT',
                  'B02067ctx3.fillStyle=gr(0,my*2,c1,c2);CTB02067ctx3.beginPath();C',
                  'TB02067ctx3.moveTo(-mx/2,0);CTB02067ctx3.lineTo(mx/2,0);CTB02067',
                  'ctx3.bezierCurveTo(mx/2,my,mx/2-D/2,my,mx/2-D,my);CTB02067ctx3.l',
                  'ineTo(-mx/2+D,my);CTB02067ctx3.bezierCurveTo(-mx/2+D/2,my,-mx/2,',
                  'my,-mx/2,0);CTB02067ctx3.fill();CTB02067ctx3.strokeStyle=gr(-my,',
                  "my,'white','black');for(let%20i=0;i<100;i++){CTB02067ctx3.beginP",
                  'ath();CTB02067ctx3.lineWidth=ss/1500;var%20posy=my*Math.random()',
                  ',%20posx=-mx/2+D/2*posy/my,%20Lx=mx-D*posy/my;CTB02067ctx3.moveT',
                  'o(posx+Lx*Math.random(),posy);CTB02067ctx3.lineTo(posx+Lx*Math.r',
                  'andom(),posy);CTB02067ctx3.stroke();};CTB02067ctx3.beginPath();C',
                  'TB02067ctx3.strokeStyle=gr(-b,b,c1,c2);CTB02067ctx3.lineWidth=b;',
                  "CTB02067ctx3.lineCap='round';CTB02067ctx3.moveTo(-mx/2,0);CTB020",
                  '67ctx3.lineTo(mx/2,0);CTB02067ctx3.stroke();};</script><script>c',
                  "onst%20canvas1=document.getElementById('layer1');const%20CTB0206",
                  "7ctx1=canvas1.getContext('2d');const%20canvas2=document.getEleme",
                  "ntById('layer2');const%20CTB02067ctx2=canvas2.getContext('2d');c",
                  "onst%20canvas3=document.getElementById('layer3');const%20CTB0206",
                  "7ctx3=canvas3.getContext('2d');var%20WIDTH=window.innerWidth;var",
                  '%20HEIGHT=window.innerHeight;canvas1.width=WIDTH;canvas1.height=',
                  'HEIGHT;canvas2.width=WIDTH;canvas2.height=HEIGHT;canvas3.width=W',
                  'IDTH;canvas3.height=HEIGHT;function%20resizeCanvas(){WIDTH=windo',
                  'w.innerWidth;HEIGHT=window.innerHeight;canvas1.width=WIDTH;canva',
                  's1.height=HEIGHT;canvas2.width=WIDTH;canvas2.height=HEIGHT;canva',
                  's3.width=WIDTH;canvas3.height=HEIGHT;location.reload()}window.ad',
                  "dEventListener('resize',resizeCanvas,false);function%20InitAll()",
                  '{CTB02067I1();CTB02067I2();CTB02067I3();DrawAll()}function%20Dra',
                  'wAll(){CTB02067D1(.5,.5,1,1);CTB02067D2(.5,.6,1,1);CTB02067D3(.5',
                  ',.6,1,1)}InitAll();</script></section></body></html>',
                ],
              },
            ],
            image: [
              'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcm',
              'cvMjAwMC9zdmciIHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4Ij48Y2lyY2xlIGN4PS',
              'I1NCIgY3k9IjU0IiByPSI1MCIgZmlsbD0iI0ZGQTUwMCIvPjxlbGxpcHNlIGN4PS',
              'I1MCIgY3k9IjI5IiByeD0iOCIgcnk9IjMiIGZpbGw9IiMwMDhCOEIiLz48ZWxsaX',
              'BzZSBjeD0iMjQiIGN5PSI1NyIgcng9IjE4IiByeT0iMTAiIGZpbGw9IiMwMDhCOE',
              'IiLz48ZWxsaXBzZSBjeD0iNzUiIGN5PSI4MiIgcng9IjE3IiByeT0iOCIgZmlsbD',
              '0iIzAwOEI4QiIvPjxlbGxpcHNlIGN4PSI1NSIgY3k9IjczIiByeD0iMTkiIHJ5PS',
              'IxMCIgZmlsbD0iIzAwOEI4QiIvPjxlbGxpcHNlIGN4PSI0OSIgY3k9IjM5IiByeD',
              '0iOCIgcnk9IjMiIGZpbGw9IiMwMDhCOEIiLz48ZWxsaXBzZSBjeD0iNjEiIGN5PS',
              'I0MCIgcng9IjkiIHJ5PSI0IiBmaWxsPSIjMDA4QjhCIi8+PHBhdGggZmlsbD0iIz',
              'dCNjhFRSIgZD0iTTQzLjQgODQuNWMtOS43LTcuOC0xMy4xLTEwLjYtMTQuOC0xMi',
              '41LTEuMy0xLjUtMy45LTYuMi0xLjQtMTEuMS03LjQtMy44LTE0LjktLjYtMTcuNS',
              '4yIDEuOC0xLjEgNC42LTIuNSA4LjgtMi44LS4yLS42LS4zLTEuMS0yLjYtMyAyIC',
              '45IDMuOSAyLjIgNC41IDIuOSAyLjIgMCA0LjguNCA3LjcgMS40LjctMSAxLjUtMS',
              '45IDIuNy0yLjkuMS0uMS4zLS4yLjQtLjMtLjgtMS44LTQuOC0zLjMtOC45LTQuMi',
              'AzLS4yIDcuNC40IDEwLjkgMi43IDYuOS00LjkgMTIuNS02LjEgMTYuOS0xMiAuNS',
              '0uNi44LTEuMiAxLjItMS43LTEtLjItMi0uNi0yLjktMS45LjkuNCAyLjMgMS40ID',
              'MuNSAxIDEuMS0xLjkgMS0zLjUuNC01LjYtLjQtLjktMS0yLjgtMy4zLTYuOCAxID',
              'EgMS45IDIgMi44IDMgLjYuMiAxLjMtLjIgMS45LS44LS4xLjYtLjcgMS0xLjIgMS',
              '41LjcuOCAxLjMgMS42IDEuOSAyLjQgMS41IDIuOSAxLjUgNC42LjkgNy4xIDEuNS',
              '44IDMuOC4yIDcuMi0uNi0zLjIgMS43LTUuMiAyLjEtNy43IDIuMS0uNSAxLTEuMi',
              'AxLjUtMiAyLjYtMi42IDQtMTIuOSAxMC44LTE1LjkgMTMuNy0zIDIuOS02LjQgOC',
              '4xIDIuMyAxMy4yIDMgMS44IDcgMy44IDEwLjcgNi4yLjktLjggNy00LjkgMTMuNi',
              '01LjYtMy4zIDEuNC01LjkgMi43LTcuNSA0LjMgMSAxLjIgMi40IDEuOSA2LjIgMi',
              '43LTUuMi4xLTUuNi0uNi03LjItMS42LS43IDEtMSAyLjEtMSAzLjQgMS4zIDEuMi',
              'AyLjUgMi40IDMuMyAzLjggOC0yLjkgMTEuMi0zIDE2LjYtMi4xIDYuNS0yLjggOS',
              '45LTQuNSAxMy01LjEtMy43IDEuNi03IDMuMi0xMC41IDUuNiA0LjggMS4yIDguNC',
              'AzLjEgMTAuNSA0LTE4LjctNC41LTE5LjktNC41LTI4LjUtLjEgMy43IDguNCAxLj',
              'QgMTYuMi4zIDE2LjUtNC42IDEuMS0xNiAuMi0xNy41LTEuNyAzLjItMy42IDEyLj',
              'EtMTAuMSAyLjQtMTcuOXoiLz48L3N2Zz4K',
            ],
            mediaType: 'image/svg+xml',
            name: 'CardanoTrees Bonsai 02067',
          },
        },
      },
    };
    const { data, error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error).toBeNull();
    expect(data?.policyId).toBe('4bfa713fc28cdd2d5e2adb518ef1265f715e39ee5af0f7be14bfa8bf');
    console.log(data?.assets);
    expect(data?.assets[0]).toBeDefined();
    expect(data?.assets[0]?.assetName).toBe('CTB02067');
    expect(data?.assets[0]?.other?.name).toBeUndefined();
    expect(data?.assets[0]?.name).toBe('CardanoTrees Bonsai 02067');
    expect(data?.assets[0]?.mediaType).toBe('image/svg+xml');
  });
});
