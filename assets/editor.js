/*!
 * Motion Studio – visual editor.
 * Loads the site in an iframe (same origin) and edits its DOM directly.
 */
(function () {
	'use strict';

	var CFG = window.MS_EDITOR || {};

	/* ==================================================================
	 * 1. LIBRARIES (fonts, text styles, presets, recipes)
	 * ================================================================== */

	var FONTS = [
		['Poppins', '300;400;500;600;700;800;900', 'sans-serif'], ['Inter', '300;400;500;600;700;800;900', 'sans-serif'],
		['Montserrat', '300;400;500;600;700;800;900', 'sans-serif'], ['Roboto', '300;400;500;700;900', 'sans-serif'],
		['Open Sans', '300;400;600;700;800', 'sans-serif'], ['Lato', '300;400;700;900', 'sans-serif'],
		['Raleway', '300;400;500;600;700;800;900', 'sans-serif'], ['Nunito', '300;400;600;700;800;900', 'sans-serif'],
		['Rubik', '300;400;500;600;700;800;900', 'sans-serif'], ['Kanit', '300;400;500;600;700;800;900', 'sans-serif'],
		['Space Grotesk', '300;400;500;600;700', 'sans-serif'], ['Syne', '400;500;600;700;800', 'sans-serif'],
		['Oswald', '300;400;500;600;700', 'sans-serif'], ['Bebas Neue', '400', 'sans-serif'], ['Anton', '400', 'sans-serif'],
		['Archivo Black', '400', 'sans-serif'], ['Righteous', '400', 'sans-serif'], ['Comfortaa', '300;400;500;600;700', 'sans-serif'],
		['Orbitron', '400;500;600;700;800;900', 'sans-serif'], ['Audiowide', '400', 'sans-serif'], ['Bungee', '400', 'sans-serif'],
		['Monoton', '400', 'sans-serif'], ['Press Start 2P', '400', 'monospace'],
		['Playfair Display', '400;500;600;700;800;900', 'serif'], ['Merriweather', '300;400;700;900', 'serif'],
		['Lora', '400;500;600;700', 'serif'], ['DM Serif Display', '400', 'serif'], ['Abril Fatface', '400', 'serif'],
		['Cinzel', '400;500;600;700;800;900', 'serif'],
		['Pacifico', '400', 'cursive'], ['Lobster', '400', 'cursive'], ['Caveat', '400;500;600;700', 'cursive'],
		['Dancing Script', '400;500;600;700', 'cursive'], ['Great Vibes', '400', 'cursive'], ['Satisfy', '400', 'cursive'],
		['Permanent Marker', '400', 'cursive'], ['Shadows Into Light', '400', 'cursive'], ['Bangers', '400', 'cursive'],
		['Fira Code', '300;400;500;600;700', 'monospace'], ['Space Mono', '400;700', 'monospace']
	];
	var FONT_MAP = {};
	FONTS.forEach(function (f) { FONT_MAP[f[0]] = f; });
	function fontValue(name) { var f = FONT_MAP[name]; return f ? "'" + f[0] + "', " + f[2] : name; }

	var CLIP = { '-webkit-background-clip': 'text', 'background-clip': 'text', 'color': 'transparent', '-webkit-text-fill-color': 'transparent' };
	function clip(bg, extra) { return Object.assign({ 'background-image': bg }, CLIP, extra || {}); }

	var TEXT_PRESETS = {
		'gradient': { n: 'Gradient', css: clip('linear-gradient(90deg,#ff3cac,#784ba0,#2b86c5)') },
		'sunset': { n: 'Sunset', css: clip('linear-gradient(90deg,#f12711,#f5af19)') },
		'ocean': { n: 'Ocean', css: clip('linear-gradient(90deg,#00c6ff,#0072ff)') },
		'aurora': { n: 'Aurora', css: clip('linear-gradient(90deg,#00f260,#0575e6,#a100ff)') },
		'gold': { n: 'Gold', css: clip('linear-gradient(180deg,#fcf6ba 0%,#bf953f 45%,#b38728 55%,#fbf5b7 100%)') },
		'chrome': { n: 'Chrome', css: clip('linear-gradient(180deg,#f5f5f5 0%,#9a9a9a 48%,#5c5c5c 50%,#d8d8d8 100%)') },
		'animated-gradient': { n: 'Moving gradient', css: clip('linear-gradient(90deg,#ff3cac,#784ba0,#2b86c5,#ff3cac)', { 'background-size': '300% 100%', 'animation': 'ms-ts-grad 6s linear infinite' }) },
		'striped': { n: 'Striped', css: clip('repeating-linear-gradient(45deg,#111 0 4px,#ff3cac 4px 8px)') },
		'split': { n: 'Split color', css: clip('linear-gradient(180deg,#111 50%,#ff3cac 50%)') },
		'outline': { n: 'Outline', css: { 'color': 'transparent', '-webkit-text-fill-color': 'transparent', '-webkit-text-stroke': '2px #222' } },
		'outline-white': { n: 'Outline white', dark: 1, css: { 'color': 'transparent', '-webkit-text-fill-color': 'transparent', '-webkit-text-stroke': '2px #fff' } },
		'neon': { n: 'Neon blue', dark: 1, css: { 'color': '#fff', 'text-shadow': '0 0 5px #fff,0 0 10px #0ff,0 0 20px #0ff,0 0 40px #0ff,0 0 80px #0ff' } },
		'neon-pink': { n: 'Neon pink', dark: 1, css: { 'color': '#fff', 'text-shadow': '0 0 5px #fff,0 0 10px #ff2fd0,0 0 20px #ff2fd0,0 0 40px #ff2fd0,0 0 80px #ff2fd0' } },
		'glow-pulse': { n: 'Glow pulse', dark: 1, css: { 'color': '#7cf9ff', 'animation': 'ms-ts-glow 1.6s ease-in-out infinite alternate' } },
		'3d': { n: '3D', css: { 'color': '#fff', 'text-shadow': '0 1px 0 #ccc,0 2px 0 #c9c9c9,0 3px 0 #bbb,0 4px 0 #b9b9b9,0 5px 0 #aaa,0 6px 1px rgba(0,0,0,.1),0 0 5px rgba(0,0,0,.1),0 1px 3px rgba(0,0,0,.3),0 3px 5px rgba(0,0,0,.2),0 5px 10px rgba(0,0,0,.25),0 10px 10px rgba(0,0,0,.2),0 20px 20px rgba(0,0,0,.15)' } },
		'long-shadow': { n: 'Long shadow', css: { 'color': '#ff3cac', 'text-shadow': '1px 1px 0 #b0287a,2px 2px 0 #b0287a,3px 3px 0 #b0287a,4px 4px 0 #b0287a,5px 5px 0 #b0287a,6px 6px 0 #b0287a,7px 7px 0 #b0287a,8px 8px 0 #b0287a' } },
		'retro': { n: 'Retro', css: { 'color': '#f7d046', 'text-shadow': '3px 3px 0 #e8505b,6px 6px 0 #14b1ab' } },
		'shadow-pop': { n: 'Shadow pop', css: { 'color': '#111', 'text-shadow': '4px 4px 0 #ff3cac' } },
		'anaglyph': { n: 'Anaglyph', css: { 'text-shadow': '-3px 0 rgba(255,0,80,.8),3px 0 rgba(0,220,255,.8)' } },
		'soft-shadow': { n: 'Soft shadow', css: { 'text-shadow': '0 6px 20px rgba(0,0,0,.25)' } },
		'emboss': { n: 'Emboss', css: { 'color': '#d9d9d9', 'text-shadow': '-1px -1px 0 #fff,1px 1px 0 #8a8a8a' } },
		'letterpress': { n: 'Letterpress', css: { 'color': '#555', 'text-shadow': '0 1px 1px rgba(255,255,255,.8)' } },
		'fire': { n: 'Fire', dark: 1, css: { 'color': '#fff7d6', 'text-shadow': '0 0 4px #fff,0 -5px 4px #ff3,2px -10px 6px #fd3,-2px -15px 11px #f80,2px -25px 18px #f20' } },
		'ice': { n: 'Ice', dark: 1, css: { 'color': '#e8fbff', 'text-shadow': '0 0 6px #9be7ff,0 0 14px #4fc3f7,0 0 30px #0288d1' } },
		'blur-glow': { n: 'Blurred', css: { 'color': 'transparent', 'text-shadow': '0 0 6px rgba(0,0,0,.7)' } },
		'highlighter': { n: 'Highlighter', css: { 'background-image': 'linear-gradient(transparent 58%,#ffe066 58%)', 'box-decoration-break': 'clone', '-webkit-box-decoration-break': 'clone' } },
		'marker-pink': { n: 'Pink marker', css: { 'background-image': 'linear-gradient(104deg,transparent .9%,#ffb3e6 2.4%,#ff8fd8 5.8%,rgba(255,143,216,.6) 93%,transparent 96%)', 'padding': '0 .2em', 'box-decoration-break': 'clone', '-webkit-box-decoration-break': 'clone' } },
		'wavy': { n: 'Wavy underline', css: { 'text-decoration': 'underline wavy #ff3cac', 'text-underline-offset': '6px', 'text-decoration-thickness': '2px' } },
		'label': { n: 'Label', css: { 'background-color': '#111', 'color': '#fff', 'padding': '.15em .55em', 'border-radius': '6px', 'display': 'inline-block' } },
		'spaced-caps': { n: 'Spaced caps', css: { 'text-transform': 'uppercase', 'letter-spacing': '.3em', 'font-weight': '600' } },
		'elegant': { n: 'Elegant serif', font: 'Playfair Display', css: { 'font-family': fontValue('Playfair Display'), 'font-style': 'italic', 'letter-spacing': '.01em' } },
		'display': { n: 'Display bold', font: 'Bebas Neue', css: { 'font-family': fontValue('Bebas Neue'), 'letter-spacing': '.04em', 'text-transform': 'uppercase' } },
		'handwritten': { n: 'Handwritten', font: 'Caveat', css: { 'font-family': fontValue('Caveat'), 'font-weight': '600' } },
		'script': { n: 'Script', font: 'Great Vibes', css: { 'font-family': fontValue('Great Vibes'), 'font-weight': '400' } },
		'terminal': { n: 'Terminal', font: 'Fira Code', dark: 1, css: { 'font-family': fontValue('Fira Code'), 'color': '#39ff14', 'background-color': '#0b0f0c', 'padding': '.2em .5em', 'border-radius': '4px' } },
		'comic': { n: 'Comic', font: 'Bangers', css: { 'font-family': fontValue('Bangers'), 'color': '#ffd400', '-webkit-text-stroke': '1.5px #000', 'text-shadow': '4px 4px 0 #000', 'letter-spacing': '.04em' } },
		'vintage': { n: 'Vintage', font: 'Abril Fatface', css: { 'font-family': fontValue('Abril Fatface'), 'color': '#7a4b2a', 'text-shadow': '2px 2px 0 #e8d3b0' } },
		'arcade': { n: 'Arcade', font: 'Press Start 2P', dark: 1, css: { 'font-family': fontValue('Press Start 2P'), 'color': '#ffde59', 'text-shadow': '3px 3px 0 #ff3c3c', 'line-height': '1.5' } },
		'futuristic': { n: 'Futuristic', font: 'Orbitron', dark: 1, css: { 'font-family': fontValue('Orbitron'), 'color': '#e0f7ff', 'letter-spacing': '.12em', 'text-shadow': '0 0 10px rgba(0,229,255,.7)' } },
		'royal': { n: 'Royal', font: 'Cinzel', css: { 'font-family': fontValue('Cinzel'), 'letter-spacing': '.08em', 'color': '#5b3b00' } }
	};

	var GRADIENTS = [
		['Neon', 'linear-gradient(135deg,#ff3cac,#784ba0,#2b86c5)'], ['Sunset', 'linear-gradient(135deg,#ff9a8b,#ff6a88 55%,#ff99ac)'],
		['Ocean', 'linear-gradient(135deg,#2b86c5,#784ba0)'], ['Aurora', 'linear-gradient(135deg,#00c6ff,#0072ff 40%,#7f00ff)'],
		['Mint', 'linear-gradient(135deg,#d4fc79,#96e6a1)'], ['Peach', 'linear-gradient(135deg,#ffecd2,#fcb69f)'],
		['Fire', 'linear-gradient(135deg,#f12711,#f5af19)'], ['Night', 'linear-gradient(135deg,#0f2027,#203a43,#2c5364)'],
		['Royal', 'linear-gradient(135deg,#141e30,#243b55)'], ['Gold', 'linear-gradient(135deg,#bf953f,#fcf6ba,#b38728,#fbf5b7,#aa771c)'],
		['Lavender', 'linear-gradient(135deg,#e0c3fc,#8ec5fc)'], ['Dark', 'linear-gradient(180deg,#232526,#414345)']
	];
	var SHADOWS = [
		['None', 'none'], ['Soft', '0 4px 14px rgba(0,0,0,.08)'], ['Medium', '0 10px 30px rgba(0,0,0,.15)'],
		['Deep', '0 25px 50px -12px rgba(0,0,0,.35)'], ['Float', '0 30px 60px -20px rgba(50,50,93,.35),0 18px 36px -18px rgba(0,0,0,.4)'],
		['Glow', '0 0 30px rgba(124,92,255,.6)'], ['Hard', '8px 8px 0 #111'], ['Inner', 'inset 0 2px 10px rgba(0,0,0,.2)'],
		['Neon', '0 0 10px #0ff,0 0 40px #0ff']
	];
	var FILTERS = [
		['None', 'none'], ['B&W', 'grayscale(1)'], ['Sepia', 'sepia(.8)'], ['Blur', 'blur(3px)'], ['Bright', 'brightness(1.2)'],
		['Contrast', 'contrast(1.35)'], ['Vivid', 'saturate(1.8)'], ['Hue', 'hue-rotate(90deg)'], ['Invert', 'invert(1)'],
		['Dark', 'brightness(.6)'], ['Shadow', 'drop-shadow(0 10px 20px rgba(0,0,0,.3))']
	];

	var IN_LIST = ['fade', 'fade-up', 'fade-down', 'fade-left', 'fade-right', 'slide-up', 'slide-down', 'slide-left', 'slide-right',
		'zoom-in', 'zoom-out', 'pop', 'bounce-in', 'drop', 'elastic', 'flip-x', 'flip-y', 'rotate-in', 'roll-in', 'swing-in', 'tilt-in',
		'skew-in', 'light-speed', 'blur-in', 'unfold', 'reveal-left', 'reveal-right', 'reveal-up', 'reveal-down', 'curtain', 'circle',
		'diamond', 'glitch-in', 'typewriter'];
	var OUT_LIST = IN_LIST.filter(function (x) { return x !== 'typewriter'; });
	var LOOP_LIST = ['pulse', 'heartbeat', 'float', 'bounce', 'shake', 'head-shake', 'wobble', 'swing', 'sway', 'tada', 'jello', 'rubber-band', 'spin', 'flash', 'breathe'];
	var FX_GROUPS = [
		['Glitch & distortion', ['glitch', 'rgb-split', 'jitter', 'scramble']],
		['Motion', ['bounce', 'float', 'heartbeat', 'spin-slow', 'ken-burns', 'parallax']],
		['Glow & light', ['neon', 'pulse-glow', 'outline-glow', 'border-glow', 'shine', 'spotlight', 'cursor-glow']],
		['Color', ['gradient-bg', 'rainbow', 'glass']],
		['Hover', ['lift', 'grow', 'zoom-hover', 'shrink', 'tilt', 'magnetic', 'shadow-pop', 'underline', 'grayscale', 'blur-hover', 'invert-hover', 'rotate-hover', 'skew-hover', 'wiggle-hover', 'swing-hover', 'dim-others']],
		['Interactive', ['ripple', 'counter']]
	];
	var FX_HELP = {
		glitch: 'Cyber glitch (text gets RGB slices, boxes/images flicker)', scramble: 'Text decodes from random characters', counter: 'Numbers count up when visible',
		parallax: 'Moves slower than scroll', tilt: '3D tilt following the mouse', magnetic: 'Pulled toward the cursor', ripple: 'Material ripple on click',
		spotlight: 'Light follows cursor', 'cursor-glow': 'Colored glow follows cursor', 'dim-others': 'Hovering one child dims siblings',
		'ken-burns': 'Slow cinematic zoom (images)', glass: 'Frosted glass background'
	};

	var RECIPES = [
		{ n: 'Hero entrance', i: '🚀', d: 'Children rise in one after another on load', r: { anim: { in: 'fade-up', trigger: 'load', stagger: 160, duration: 900, easing: 'expo', distance: 50 } } },
		{ n: 'Menu pop', i: '🍔', d: 'Menu items pop in one by one', menu: 1, r: { anim: { in: 'pop', trigger: 'load', stagger: 70, duration: 500, easing: 'back' } } },
		{ n: 'Cards stagger', i: '🃏', d: 'Grid/columns appear one by one on scroll', r: { anim: { in: 'fade-up', stagger: 120, duration: 700 } } },
		{ n: 'Letters rise', i: '🔠', d: 'Heading letters rise one by one', r: { anim: { in: 'fade-up', split: 'letters', stagger: 30, duration: 600, distance: 30, easing: 'back' } } },
		{ n: 'Words blur in', i: '💬', d: 'Words un-blur one by one', r: { anim: { in: 'blur-in', split: 'words', stagger: 90, duration: 700 } } },
		{ n: 'Typewriter', i: '⌨️', d: 'Typed letter by letter with caret', r: { anim: { in: 'typewriter', stagger: 45 } } },
		{ n: 'Image reveal', i: '🖼️', d: 'Wipe reveal + slow zoom', r: { anim: { in: 'reveal-left', duration: 1100, easing: 'expo' }, fx: { list: ['ken-burns'] } } },
		{ n: 'Glitch title', i: '👾', d: 'Glitch entrance + glitch loop', r: { anim: { in: 'glitch-in', duration: 700 }, fx: { list: ['glitch'] } } },
		{ n: 'Neon sign', i: '💡', d: 'Flicker on, then neon glow', r: { anim: { in: 'fade', duration: 400 }, loop: { type: 'flash', duration: 4000, trigger: 'always' }, fx: { list: ['neon'], color: '#00e5ff' } } },
		{ n: 'Attention button', i: '👉', d: 'Pops in, then pulses + lifts on hover', r: { anim: { in: 'pop', duration: 600, easing: 'back' }, loop: { type: 'pulse', duration: 1800, trigger: 'always' }, fx: { list: ['lift', 'ripple'] } } },
		{ n: 'Floating badge', i: '🎈', d: 'Gently floats forever', r: { fx: { list: ['float'] } } },
		{ n: 'Parallax image', i: '🏔️', d: 'Scrolls slower than the page', r: { fx: { list: ['parallax'], intensity: 1 } } },
		{ n: '3D card', i: '🧊', d: 'Tilts with the mouse, spotlight, lift', r: { fx: { list: ['tilt', 'spotlight'] } } },
		{ n: 'Footer rise', i: '⬆️', d: 'Footer slides up when reached', r: { anim: { in: 'fade-up', distance: 80, duration: 1000 } } },
		{ n: 'Scroll both ways', i: '↕️', d: 'Fades in when entering, out when leaving', r: { anim: { in: 'fade-up', out: 'fade-up', outTrigger: 'leave', once: false } } },
		{ n: 'Popup notice', i: '🔔', d: 'Zooms in on load, zooms out after 4s', r: { anim: { in: 'zoom-in', trigger: 'load', out: 'zoom-out', outTrigger: 'delay', outDelay: 4000, easing: 'back' } } },
		{ n: 'Stats counter', i: '🔢', d: 'Numbers count up when visible', r: { fx: { list: ['counter'] }, anim: { in: 'fade-up' } } },
		{ n: 'Decode text', i: '🧬', d: 'Hacker-style text decode', r: { fx: { list: ['scramble'] } } }
	];

	var LAYOUTS = [
		['Row', { display: 'flex', 'flex-direction': 'row', 'align-items': 'center', gap: '24px' }],
		['Column', { display: 'flex', 'flex-direction': 'column', gap: '16px' }],
		['Center all', { display: 'flex', 'flex-direction': 'column', 'justify-content': 'center', 'align-items': 'center', 'text-align': 'center' }],
		['Space between', { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' }],
		['2 columns', { display: 'grid', 'grid-template-columns': 'repeat(2,minmax(0,1fr))', gap: '24px' }],
		['3 columns', { display: 'grid', 'grid-template-columns': 'repeat(3,minmax(0,1fr))', gap: '24px' }],
		['4 columns', { display: 'grid', 'grid-template-columns': 'repeat(4,minmax(0,1fr))', gap: '20px' }],
		['Sidebar 1:2', { display: 'grid', 'grid-template-columns': '1fr 2fr', gap: '32px' }],
		['Container', { 'max-width': '1200px', 'margin-left': 'auto', 'margin-right': 'auto', 'padding-left': '20px', 'padding-right': '20px' }],
		['Full width', { width: '100vw', 'max-width': '100vw', 'margin-left': 'calc(50% - 50vw)', 'margin-right': 'calc(50% - 50vw)' }],
		['Full height', { 'min-height': '100vh' }],
		['Sticky top', { position: 'sticky', top: '0', 'z-index': '100' }],
		['Stack on mobile', null, 'mobile'],
		['Reset layout', 'reset']
	];
	var LAYOUT_PROPS = ['display', 'flex-direction', 'justify-content', 'align-items', 'flex-wrap', 'gap', 'grid-template-columns', 'max-width',
		'width', 'height', 'min-height', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom', 'padding-left', 'padding-right', 'padding-top',
		'padding-bottom', 'position', 'top', 'z-index', 'translate', 'text-align', 'order', 'box-sizing', 'overflow'];

	var DEVICES = { desktop: '100%', tablet: '820px', mobile: '390px' };
	var MQ = { tablet: '@media (max-width:1024px)', mobile: '@media (max-width:767px)' };
	var NO_IMPORTANT = { translate: 1 };

	/* ==================================================================
	 * 1b. LIBRARIES – drag & drop elements, sections, frames, icons,
	 *     menu styles, site themes
	 * ================================================================== */

	var PH = (CFG.pluginUrl || '') + 'assets/placeholder.svg';
	function svgUri(inner, vb) {
		return 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (vb || '0 0 24 24') + '" preserveAspectRatio="none">' + inner + '</svg>') + '")';
	}
	function maskCss(inner, vb, extra) {
		var u = svgUri(inner, vb);
		return Object.assign({ '-webkit-mask': u + ' center / 100% 100% no-repeat', 'mask': u + ' center / 100% 100% no-repeat' }, extra || {});
	}
	var SQ = { 'aspect-ratio': '1 / 1', 'object-fit': 'cover', 'height': 'auto' };
	function poly(p, extra) { return Object.assign({ 'clip-path': 'polygon(' + p + ')' }, SQ, extra || {}); }

	var FRAMES = {
		'circle': { n: 'Circle', css: Object.assign({ 'border-radius': '50%' }, SQ) },
		'rounded': { n: 'Rounded', css: { 'border-radius': '28px' } },
		'squircle': { n: 'Squircle', css: Object.assign({ 'border-radius': '32%' }, SQ) },
		'pill': { n: 'Pill', css: { 'border-radius': '999px', 'aspect-ratio': '2 / 1', 'object-fit': 'cover', 'height': 'auto' } },
		'arch': { n: 'Arch', css: { 'border-radius': '999px 999px 0 0', 'aspect-ratio': '3 / 4', 'object-fit': 'cover', 'height': 'auto' } },
		'arch-down': { n: 'Arch down', css: { 'border-radius': '0 0 999px 999px', 'aspect-ratio': '3 / 4', 'object-fit': 'cover', 'height': 'auto' } },
		'leaf': { n: 'Leaf', css: Object.assign({ 'border-radius': '0 50% 0 50%' }, SQ) },
		'blob': { n: 'Blob', css: Object.assign({ 'border-radius': '63% 37% 54% 46% / 55% 48% 52% 45%' }, SQ) },
		'blob-2': { n: 'Blob 2', css: Object.assign({ 'border-radius': '40% 60% 70% 30% / 40% 50% 60% 50%' }, SQ) },
		'morph': { n: 'Morphing', css: Object.assign({ 'border-radius': '63% 37% 54% 46% / 55% 48% 52% 45%', 'animation': 'ms-morph 9s ease-in-out infinite' }, SQ) },
		'hexagon': { n: 'Hexagon', css: poly('25% 3%,75% 3%,100% 50%,75% 97%,25% 97%,0 50%') },
		'triangle': { n: 'Triangle', css: poly('50% 0,100% 100%,0 100%') },
		'diamond': { n: 'Diamond', css: poly('50% 0,100% 50%,50% 100%,0 50%') },
		'pentagon': { n: 'Pentagon', css: poly('50% 0,100% 38%,82% 100%,18% 100%,0 38%') },
		'octagon': { n: 'Octagon', css: poly('30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%') },
		'star': { n: 'Star', css: poly('50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%') },
		'cross': { n: 'Plus', css: poly('33% 0,67% 0,67% 33%,100% 33%,100% 67%,67% 67%,67% 100%,33% 100%,33% 67%,0 67%,0 33%,33% 33%') },
		'bubble': { n: 'Speech', css: { 'clip-path': 'polygon(0 0,100% 0,100% 78%,40% 78%,22% 100%,24% 78%,0 78%)', 'object-fit': 'cover' } },
		'slant': { n: 'Slant', css: { 'clip-path': 'polygon(0 0,100% 0,100% 82%,0 100%)', 'object-fit': 'cover' } },
		'parallelogram': { n: 'Slanted', css: { 'clip-path': 'polygon(12% 0,100% 0,88% 100%,0 100%)', 'object-fit': 'cover' } },
		'heart': { n: 'Heart', css: maskCss('<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"/>', '0 0 24 24', SQ) },
		'cloud': { n: 'Cloud', css: maskCss('<path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>', '0 3 24 18', { 'aspect-ratio': '4 / 3', 'object-fit': 'cover', 'height': 'auto' }) },
		'flower': { n: 'Flower', css: maskCss('<circle cx="50" cy="24" r="24"/><circle cx="76" cy="50" r="24"/><circle cx="50" cy="76" r="24"/><circle cx="24" cy="50" r="24"/><circle cx="50" cy="50" r="30"/>', '0 0 100 100', SQ) },
		'wave': { n: 'Wave', css: maskCss('<path d="M0 0H100V86Q75 100 50 86T0 86Z"/>', '0 0 100 100', { 'object-fit': 'cover' }) },
		'ring': { n: 'Ring', css: Object.assign({ 'border-radius': '50%', 'border': '6px solid #fff', 'box-shadow': '0 0 0 5px var(--ms-primary,#7c3aed)' }, SQ) },
		'gradient-border': { n: 'Gradient border', css: { 'padding': '6px', 'border-radius': '24px', 'background': 'linear-gradient(135deg,#ff3cac,#784ba0,#2b86c5)', 'box-sizing': 'border-box' } },
		'polaroid': { n: 'Polaroid', css: { 'padding': '12px 12px 54px', 'background': '#fff', 'box-shadow': '0 18px 40px -14px rgba(0,0,0,.4)', 'rotate': '-3deg', 'box-sizing': 'border-box' } },
		'gallery': { n: 'Gallery frame', css: { 'border': '16px solid #fff', 'outline': '1px solid #d9d9d9', 'box-shadow': '0 20px 40px -18px rgba(0,0,0,.45),inset 0 0 0 1px #eee', 'box-sizing': 'border-box' } },
		'phone': { n: 'Phone', css: { 'border': '12px solid #111', 'border-radius': '38px', 'aspect-ratio': '9 / 19', 'object-fit': 'cover', 'height': 'auto', 'box-shadow': '0 30px 60px -20px rgba(0,0,0,.5)', 'box-sizing': 'border-box' } },
		'tablet': { n: 'Tablet', css: { 'border': '16px solid #1c1c1e', 'border-radius': '28px', 'aspect-ratio': '3 / 4', 'object-fit': 'cover', 'height': 'auto', 'box-shadow': '0 30px 60px -20px rgba(0,0,0,.5)', 'box-sizing': 'border-box' } },
		'browser': { n: 'Browser', css: { 'padding-top': '30px', 'border-radius': '12px', 'background': 'radial-gradient(circle at 16px 15px,#ff5f57 5px,transparent 6px),radial-gradient(circle at 34px 15px,#febc2e 5px,transparent 6px),radial-gradient(circle at 52px 15px,#28c840 5px,transparent 6px),#e9e9ee', 'box-shadow': '0 24px 50px -20px rgba(0,0,0,.45)', 'box-sizing': 'border-box' } },
		'tilt': { n: '3D tilt', css: { 'transform': 'perspective(900px) rotateY(-14deg) rotateX(6deg)', 'border-radius': '16px', 'box-shadow': '30px 30px 60px -20px rgba(0,0,0,.45)' } }
	};

	var ICON_PATHS = {
		star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z',
		heart: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z',
		check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
		arrow: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
		bolt: 'M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z',
		sparkle: 'M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z',
		phone: 'M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02z',
		mail: 'M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5z',
		pin: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z',
		clock: 'M12 2a10 10 0 100 20 10 10 0 000-20zm1 11h-5v-2h3V6h2z',
		shield: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5z',
		user: 'M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z',
		cart: 'M7 18a2 2 0 100 4 2 2 0 000-4zM1 2v2h2l3.6 7.59-1.35 2.45A2 2 0 007 17h12v-2H7.42l1.1-2h7.45a2 2 0 001.75-1.03l3.58-6.49A1 1 0 0020.43 4H5.21l-.94-2z',
		search: 'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16a6.47 6.47 0 004.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0a4.5 4.5 0 110-9 4.5 4.5 0 010 9z',
		play: 'M8 5v14l11-7z',
		home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
		chat: 'M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z',
		camera: 'M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4zM9 2L7.17 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-3.17L15 2z',
		music: 'M12 3v10.55A4 4 0 1014 17V7h4V3z',
		moon: 'M12 3a9 9 0 109 9 7 7 0 01-9-9z',
		fire: 'M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z',
		thumb: 'M1 21h4V9H1v12zm22-11a2 2 0 00-2-2h-6.31l.95-4.57.03-.32a1.5 1.5 0 00-.44-1.06L14.17 1 7.59 7.59A1.98 1.98 0 007 9v10a2 2 0 002 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73z',
		quote: 'M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z',
		plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z'
	};
	function iconUri(name) {
		return 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="' + ICON_PATHS[name] + '"/></svg>') + '")';
	}

	function lorem(n) { return ['Tell visitors what makes this special in one or two short sentences.', 'Double-click any text to edit it. Drag elements to reorder them.', 'Swap this image by double-clicking it or dropping a file on it.'][n || 0]; }
	function img(cls) { return '<img class="' + (cls || 'ms-img-el') + '" src="' + PH + '" alt="">'; }
	function cdDate() { var d = new Date(Date.now() + 14 * 864e5); d.setSeconds(0, 0); return d.toISOString().slice(0, 16); }

	var SEARCH_TYPES = [['classic', 'Classic box'], ['pill', 'Pill + button'], ['underline', 'Underline'], ['expand', 'Expanding icon'], ['glass', 'Glass'], ['solid', 'Input + solid button'], ['overlay', 'Full-screen overlay']];

	function logoHtml() {
		var name = esc(CFG.siteName || 'Your Brand');
		return '<a class="ms-logo-el" href="' + esc(CFG.home || '/') + '"><img src="' + esc(CFG.siteLogo || PH) + '" alt="' + name + '"><span class="ms-logo-text">' + name + '</span></a>';
	}

	var ELEMENTS = [
		{ id: 'heading', n: 'Heading', i: 'H', html: function () { return '<h2>Your heading here</h2>'; } },
		{ id: 'text', n: 'Text', i: '¶', html: function () { return '<p>' + lorem(1) + '</p>'; } },
		{ id: 'button', n: 'Button', i: '▭', html: function () { return '<div class="ms-btn-wrap"><a class="ms-btn-el" href="#">Get started</a></div>'; } },
		{ id: 'buttons', n: '2 Buttons', i: '▭▭', html: function () { return '<div class="ms-btn-wrap"><a class="ms-btn-el" href="#">Get started</a><a class="ms-btn-el ms-btn-ghost" href="#">Learn more</a></div>'; } },
		{ id: 'image', n: 'Image', i: '🖼', html: function () { return img(); } },
		{ id: 'frame', n: 'Image frame', i: '◯', html: function () { return '<figure class="ms-frame" style="max-width:360px">' + img('') + '</figure>'; }, rules: [{ s: ' img', frame: 'circle' }] },
		{ id: 'icon', n: 'Icon', i: '★', html: function () { return '<span class="ms-icon"></span>'; } },
		{ id: 'video', n: 'Video', i: '▶', html: function () { return '<div class="ms-video"><div class="ms-video-ph">▶ Paste a YouTube or Vimeo link in the Edit tab</div></div>'; } },
		{ id: 'section', n: 'Section', i: '▢', html: function () { return '<section class="ms-section"><h2>New section</h2><p>Drop elements inside this section.</p></section>'; } },
		{ id: 'cols2', n: '2 Columns', i: '▥', html: function () { return '<div class="ms-cols ms-cols-2"><div><h3>Column one</h3><p>' + lorem(0) + '</p></div><div><h3>Column two</h3><p>' + lorem(0) + '</p></div></div>'; } },
		{ id: 'cols3', n: '3 Columns', i: '▦', html: function () { return '<div class="ms-cols ms-cols-3">' + [1, 2, 3].map(function (n) { return '<div><h3>Column ' + n + '</h3><p>' + lorem(0) + '</p></div>'; }).join('') + '</div>'; } },
		{ id: 'card', n: 'Card', i: '🃏', html: function () { return '<div class="ms-card" style="max-width:380px">' + img('ms-card-img') + '<h3>Card title</h3><p>' + lorem(0) + '</p><a class="ms-btn-el" href="#">Learn more</a></div>'; } },
		{ id: 'quote', n: 'Quote', i: '❝', html: function () { return '<blockquote class="ms-quote">“A short, memorable quote goes here.”</blockquote>'; } },
		{ id: 'list', n: 'Check list', i: '✓', html: function () { return '<ul class="ms-list"><li>First benefit</li><li>Second benefit</li><li>Third benefit</li></ul>'; } },
		{ id: 'badge', n: 'Badge', i: '🏷', html: function () { return '<div><span class="ms-badge">NEW</span></div>'; } },
		{ id: 'divider', n: 'Divider', i: '—', html: function () { return '<hr class="ms-divider">'; } },
		{ id: 'spacer', n: 'Spacer', i: '↕', html: function () { return '<div class="ms-spacer"></div>'; } },
		{ id: 'wave', n: 'Wave divider', i: '〰', html: function () { return '<div class="ms-wave"></div>'; } },
		{ id: 'shape', n: 'Blob shape', i: '⬮', html: function () { return '<div class="ms-shape"></div>'; } },
		{ id: 'countdown', n: 'Countdown', i: '⏱', html: function () { return '<div class="ms-countdown" data-ms-countdown="' + cdDate() + '"></div>'; } },
		{ id: 'faq', n: 'FAQ item', i: '?', html: function () { return '<details class="ms-faq"><summary>Your question here?</summary><p>The answer goes here.</p></details>'; } },
		{ id: 'skill', n: 'Progress bar', i: '▰', html: function () { return '<div class="ms-skill"><span>Skill / goal</span><div class="ms-skill-bar"><i style="width:80%"></i></div></div>'; } },
		{ id: 'social', n: 'Social icons', i: '@', html: function () { return '<div class="ms-social"><a href="#" aria-label="Facebook">f</a><a href="#" aria-label="Instagram">ig</a><a href="#" aria-label="X">X</a><a href="#" aria-label="LinkedIn">in</a><a href="#" aria-label="YouTube">▶</a></div>'; } },
		{ id: 'popup', n: 'Popup', i: '🗔', html: function () { return '<div class="ms-popup"><div class="ms-popup-box"><button type="button" class="ms-popup-x" data-ms-close aria-label="Close">×</button><span class="ms-badge">Limited offer</span><h3>Get 20% off today</h3><p>Use the Link tab on any button to open this popup.</p><div class="ms-btn-wrap" style="justify-content:center"><a class="ms-btn-el" href="#">Claim offer</a></div></div></div>'; } }
		,{ id: 'search', n: 'Search bar', i: '🔎', html: function () { return '<div class="ms-search"></div>'; }, rules: [{ s: ' .ms-search', search: { type: 'classic', placeholder: 'Search…', scope: 'all', live: true } }] },
		{ id: 'logo', n: 'Logo', i: '◈', html: function () { return logoHtml(); }, rules: [{ s: ' .ms-logo-el', logo: { mode: 'both' } }] }
	];

	var SECTIONS = [
		{ id: 'hero-split', n: 'Hero – split', html: function () {
			return '<section class="ms-section ms-hero ms-hero-grad"><div class="ms-split"><div class="ms-hero-text"><span class="ms-badge">✨ New</span><h1>Build something people love</h1><p class="ms-lead">' + lorem(0) + '</p><div class="ms-btn-wrap"><a class="ms-btn-el" href="#">Get started</a><a class="ms-btn-el ms-btn-ghost" href="#">See how</a></div></div><figure class="ms-frame">' + img('') + '</figure></div></section>';
		}, rules: [{ s: ' .ms-hero-text', anim: { in: 'fade-up', trigger: 'load', stagger: 140, duration: 900, easing: 'expo' } }, { s: ' .ms-frame img', frame: 'blob', anim: { in: 'zoom-in', trigger: 'load', delay: 300, duration: 1100, easing: 'expo' }, fx: { list: ['float'] } }] },
		{ id: 'hero-center', n: 'Hero – centered', html: function () {
			return '<section class="ms-section ms-hero ms-hero-grad ms-center"><div><span class="ms-kicker">Welcome</span><h1>Make your website come alive</h1><p class="ms-lead">' + lorem(0) + '</p><div class="ms-btn-wrap"><a class="ms-btn-el" href="#">Start now</a><a class="ms-btn-el ms-btn-ghost" href="#">Learn more</a></div></div></section>';
		}, rules: [{ s: ' h1', text: { preset: 'gradient' }, anim: { in: 'fade-up', trigger: 'load', split: 'words', stagger: 90, duration: 800 } }, { s: ' .ms-lead', anim: { in: 'fade', trigger: 'load', delay: 500 } }, { s: ' .ms-btn-wrap', anim: { in: 'pop', trigger: 'load', delay: 700, stagger: 120 } }] },
		{ id: 'features', n: 'Features ×3', html: function () {
			return '<section class="ms-section ms-center"><span class="ms-kicker">Features</span><h2>Everything you need</h2><div class="ms-cols ms-cols-3" style="margin-top:36px">' +
				[['bolt', 'Fast'], ['shield', 'Secure'], ['sparkle', 'Beautiful']].map(function (f) { return '<div class="ms-card ms-feature"><span class="ms-icon ms-ic-' + f[0] + '"></span><h3>' + f[1] + '</h3><p>' + lorem(0) + '</p></div>'; }).join('') + '</div></section>';
		}, rules: [{ s: ' .ms-cols', anim: { in: 'fade-up', stagger: 150, duration: 800 } }, { s: ' .ms-ic-bolt', icon: 'bolt' }, { s: ' .ms-ic-shield', icon: 'shield' }, { s: ' .ms-ic-sparkle', icon: 'sparkle' }, { s: ' .ms-card', fx: { list: ['lift'] } }] },
		{ id: 'stats', n: 'Stats counters', html: function () {
			return '<section class="ms-section ms-center"><div class="ms-cols ms-cols-4">' + [['1,200+', 'Happy clients'], ['98%', 'Satisfaction'], ['24/7', 'Support'], ['15', 'Years']].map(function (s) { return '<div class="ms-stat"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>'; }).join('') + '</div></section>';
		}, rules: [{ s: ' .ms-stat b', fx: { list: ['counter'] } }, { s: ' .ms-cols', anim: { in: 'fade-up', stagger: 120 } }] },
		{ id: 'gallery', n: 'Gallery', html: function () {
			return '<section class="ms-section"><h2 class="ms-center">Gallery</h2><div class="ms-gallery" style="margin-top:28px">' + [1, 2, 3, 4, 5, 6].map(function () { return img(''); }).join('') + '</div></section>';
		}, rules: [{ s: ' .ms-gallery', anim: { in: 'zoom-in', stagger: 90, duration: 700 } }, { s: ' .ms-gallery img', fx: { list: ['grow'] } }] },
		{ id: 'pricing', n: 'Pricing', html: function () {
			return '<section class="ms-section ms-center"><h2>Simple pricing</h2><div class="ms-cols ms-cols-3" style="margin-top:36px;align-items:center">' +
				[['Starter', '9', ''], ['Pro', '29', ' ms-featured'], ['Business', '79', '']].map(function (p) { return '<div class="ms-card ms-price' + p[2] + '"><h3>' + p[0] + '</h3><div class="ms-amount">$' + p[1] + '<small style="font-size:16px">/mo</small></div><ul class="ms-list" style="text-align:left"><li>Feature one</li><li>Feature two</li><li>Feature three</li></ul><a class="ms-btn-el" href="#">Choose ' + p[0] + '</a></div>'; }).join('') + '</div></section>';
		}, rules: [{ s: ' .ms-cols', anim: { in: 'fade-up', stagger: 140 } }] },
		{ id: 'team', n: 'Team', html: function () {
			return '<section class="ms-section ms-center"><h2>Meet the team</h2><div class="ms-cols ms-cols-3 ms-team" style="margin-top:32px">' + [1, 2, 3].map(function () { return '<div>' + img('') + '<h3>Name Surname</h3><p>Role / title</p></div>'; }).join('') + '</div></section>';
		}, rules: [{ s: ' .ms-team', anim: { in: 'fade-up', stagger: 140 } }] },
		{ id: 'testimonials', n: 'Reviews (template)', html: function () {
			return '<section class="ms-section ms-center"><h2>What clients say</h2><div class="ms-cols ms-cols-3" style="margin-top:32px">' + [1, 2, 3].map(function () { return '<div class="ms-card"><p>“Paste a real customer quote here.”</p><strong>Customer name</strong></div>'; }).join('') + '</div></section>';
		}, rules: [{ s: ' .ms-cols', anim: { in: 'fade-up', stagger: 140 } }] },
		{ id: 'cta', n: 'Call to action', html: function () {
			return '<section class="ms-section"><div class="ms-cta"><h2>Ready to get started?</h2><p class="ms-lead" style="margin:0 auto">' + lorem(0) + '</p><div class="ms-btn-wrap" style="justify-content:center"><a class="ms-btn-el" href="#">Contact us</a></div></div></section>';
		}, rules: [{ s: ' .ms-cta', anim: { in: 'zoom-in', duration: 900 }, fx: { list: ['gradient-bg'] } }] },
		{ id: 'faq', n: 'FAQ', html: function () {
			return '<section class="ms-section"><h2 class="ms-center">Questions & answers</h2><div style="max-width:760px;margin:24px auto 0">' + [1, 2, 3, 4].map(function (n) { return '<details class="ms-faq"><summary>Question number ' + n + '?</summary><p>The answer goes here.</p></details>'; }).join('') + '</div></section>';
		}, rules: [] },
		{ id: 'logos', n: 'Logo marquee', html: function () {
			var t = ['BRAND', 'COMPANY', 'STUDIO', 'AGENCY', 'PARTNER', 'CLIENT'].map(function (x) { return '<span>' + x + '</span>'; }).join('');
			return '<section class="ms-section"><div class="ms-marquee"><div class="ms-marquee-track">' + t + t + '</div></div></section>';
		}, rules: [] },
		{ id: 'contact', n: 'Contact strip', html: function () {
			return '<section class="ms-section ms-center"><h2>Let’s talk</h2><p class="ms-lead">We usually reply within a few hours.</p><div class="ms-btn-wrap"><a class="ms-btn-el ms-c-mail" href="#">✉ Email us</a><a class="ms-btn-el ms-c-wa" href="#" style="background:#25d366">WhatsApp</a><a class="ms-btn-el ms-btn-ghost ms-c-tel" href="#">☎ Call</a></div></section>';
		}, rules: [{ s: ' .ms-c-mail', link: { type: 'email', value: 'hello@example.com' } }, { s: ' .ms-c-wa', link: { type: 'whatsapp', value: '', msg: 'Hi!' } }, { s: ' .ms-c-tel', link: { type: 'phone', value: '' } }] },
		{ id: 'launch', n: 'Launch countdown', html: function () {
			return '<section class="ms-section ms-center ms-hero-grad"><span class="ms-kicker">Coming soon</span><h2>Something big is launching</h2><div class="ms-countdown" data-ms-countdown="' + cdDate() + '" style="margin-top:24px"></div></section>';
		}, rules: [{ s: ' h2', anim: { in: 'fade-up', split: 'letters', stagger: 25 } }] }
	];

	var MENU_STYLES = {
		'underline': { n: 'Underline slide', css: function (s) { return s + ' a{position:relative;text-decoration:none!important}' + s + ' a::after{content:"";position:absolute;left:0;bottom:-4px;height:2px;width:100%;background:var(--ms-acc);transform:scaleX(0);transform-origin:right;transition:transform .35s ease}' + s + ' a:hover::after,' + s + ' .current-menu-item>a::after,' + s + ' [aria-current]::after{transform:scaleX(1);transform-origin:left}'; } },
		'overline': { n: 'Overline', css: function (s) { return s + ' a{position:relative;text-decoration:none!important}' + s + ' a::before{content:"";position:absolute;left:0;top:-6px;height:3px;width:100%;background:var(--ms-acc);transform:scaleX(0);transition:transform .3s}' + s + ' a:hover::before,' + s + ' .current-menu-item>a::before{transform:scaleX(1)}'; } },
		'pill': { n: 'Pill', css: function (s) { return s + ' a{padding:.5em 1.05em;border-radius:999px;text-decoration:none!important;transition:background .25s,color .25s;display:inline-block}' + s + ' a:hover,' + s + ' .current-menu-item>a,' + s + ' [aria-current]{background:var(--ms-acc);color:#fff!important}'; } },
		'gradient': { n: 'Gradient pill', css: function (s) { return s + ' a{padding:.5em 1.05em;border-radius:999px;text-decoration:none!important;display:inline-block;transition:transform .2s}' + s + ' a:hover,' + s + ' .current-menu-item>a{background:linear-gradient(135deg,var(--ms-acc),#2b86c5);color:#fff!important;transform:translateY(-1px)}'; } },
		'boxed': { n: 'Boxed', css: function (s) { return s + ' a{padding:.45em .95em;border:2px solid transparent;border-radius:8px;text-decoration:none!important;display:inline-block;transition:border-color .25s}' + s + ' a:hover,' + s + ' .current-menu-item>a{border-color:var(--ms-acc)}'; } },
		'sweep': { n: 'Fill sweep', css: function (s) { return s + ' a{padding:.45em .9em;text-decoration:none!important;display:inline-block;background:linear-gradient(var(--ms-acc),var(--ms-acc)) no-repeat 0 100%/0 100%;transition:background-size .35s ease,color .35s}' + s + ' a:hover,' + s + ' .current-menu-item>a{background-size:100% 100%;color:#fff!important}'; } },
		'glass': { n: 'Glass bar', css: function (s) { return s + '{background:rgba(255,255,255,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:6px!important}' + s + ' a{padding:.45em 1em;border-radius:999px;text-decoration:none!important;display:inline-block;transition:background .25s}' + s + ' a:hover,' + s + ' .current-menu-item>a{background:rgba(255,255,255,.28)}'; } },
		'tabs': { n: 'Segmented', css: function (s) { return s + '{background:rgba(127,127,127,.14);border-radius:14px;padding:5px!important}' + s + ' a{padding:.45em 1em;border-radius:10px;text-decoration:none!important;display:inline-block;transition:background .2s,box-shadow .2s}' + s + ' a:hover,' + s + ' .current-menu-item>a{background:#fff;color:#111!important;box-shadow:0 4px 12px rgba(0,0,0,.12)}'; } },
		'neon': { n: 'Neon glow', css: function (s) { return s + ' a{text-decoration:none!important;transition:color .25s,text-shadow .25s}' + s + ' a:hover,' + s + ' .current-menu-item>a{color:#fff!important;text-shadow:0 0 6px var(--ms-acc),0 0 16px var(--ms-acc),0 0 30px var(--ms-acc)}'; } },
		'bracket': { n: '[ Brackets ]', css: function (s) { return s + ' a{text-decoration:none!important}' + s + ' a::before{content:"[";margin-right:.25em;opacity:0;display:inline-block;transform:translateX(6px);transition:.25s;color:var(--ms-acc)}' + s + ' a::after{content:"]";margin-left:.25em;opacity:0;display:inline-block;transform:translateX(-6px);transition:.25s;color:var(--ms-acc)}' + s + ' a:hover::before,' + s + ' a:hover::after{opacity:1;transform:none}'; } },
		'dot': { n: 'Dot', css: function (s) { return s + ' a{position:relative;text-decoration:none!important}' + s + ' a::after{content:"";position:absolute;left:50%;bottom:-10px;width:6px;height:6px;margin-left:-3px;border-radius:50%;background:var(--ms-acc);transform:scale(0);transition:transform .25s}' + s + ' a:hover::after,' + s + ' .current-menu-item>a::after{transform:scale(1)}'; } },
		'strike': { n: 'Strike', css: function (s) { return s + ' a{position:relative;text-decoration:none!important}' + s + ' a::after{content:"";position:absolute;left:-4px;right:-4px;top:50%;height:2px;background:var(--ms-acc);transform:scaleX(0);transition:transform .3s}' + s + ' a:hover::after{transform:scaleX(1)}'; } },
		'grow': { n: 'Grow', css: function (s) { return s + ' a{display:inline-block;text-decoration:none!important;transition:transform .25s cubic-bezier(.34,1.56,.64,1),color .25s}' + s + ' a:hover{transform:scale(1.14);color:var(--ms-acc)!important}'; } },
		'caps': { n: 'Minimal caps', css: function (s) { return s + ' a{text-transform:uppercase;letter-spacing:.16em;font-size:.82em;font-weight:600;text-decoration:none!important;opacity:.75;transition:opacity .2s,color .2s}' + s + ' a:hover,' + s + ' .current-menu-item>a{opacity:1;color:var(--ms-acc)!important}'; } }
	};

	var THEMES = {
		'minimal': { n: 'Minimal Light', c: { bg: '#ffffff', surface: '#f6f7f9', text: '#334155', heading: '#0f172a', primary: '#2563eb', accent: '#f59e0b' }, f: { h: 'Inter', b: 'Inter' }, r: 8 },
		'startup': { n: 'Startup Purple', c: { bg: '#ffffff', surface: '#f5f3ff', text: '#4b5563', heading: '#111827', primary: '#7c3aed', accent: '#06b6d4' }, f: { h: 'Poppins', b: 'Inter' }, r: 12 },
		'dark-neon': { n: 'Dark Neon', c: { bg: '#0b0b12', surface: '#151525', text: '#c7c9d9', heading: '#ffffff', primary: '#ff3cac', accent: '#00e5ff' }, f: { h: 'Space Grotesk', b: 'Inter' }, r: 12 },
		'corporate': { n: 'Corporate', c: { bg: '#f8fafc', surface: '#ffffff', text: '#475569', heading: '#0b2545', primary: '#1d4ed8', accent: '#10b981' }, f: { h: 'Montserrat', b: 'Open Sans' }, r: 6 },
		'pastel': { n: 'Pastel Dream', c: { bg: '#fff7fb', surface: '#ffffff', text: '#6b5b6e', heading: '#3d2c4e', primary: '#c084fc', accent: '#f472b6' }, f: { h: 'Poppins', b: 'Nunito' }, r: 20 },
		'luxury': { n: 'Luxury Gold', c: { bg: '#0f0e0c', surface: '#1a1814', text: '#d6cfc4', heading: '#f3e6c4', primary: '#c9a227', accent: '#8c6d1f', onPrimary: '#111' }, f: { h: 'Playfair Display', b: 'Lato' }, r: 0 },
		'nature': { n: 'Nature', c: { bg: '#f6f8f1', surface: '#ffffff', text: '#4b5a46', heading: '#1f3b1f', primary: '#2f7d32', accent: '#e0a43b' }, f: { h: 'Lora', b: 'Nunito' }, r: 10 },
		'sunset': { n: 'Sunset Warm', c: { bg: '#fffaf5', surface: '#ffffff', text: '#5a4636', heading: '#3b1f0f', primary: '#f97316', accent: '#e11d48' }, f: { h: 'DM Serif Display', b: 'Rubik' }, r: 14 },
		'ocean': { n: 'Ocean Glass', c: { bg: '#eaf6ff', surface: '#ffffff', text: '#2d4a63', heading: '#0b2a45', primary: '#0284c7', accent: '#22d3ee' }, f: { h: 'Raleway', b: 'Inter' }, r: 16 },
		'retro': { n: 'Retro 80s', c: { bg: '#1a0b2e', surface: '#2a1450', text: '#e9d5ff', heading: '#ffde59', primary: '#ff2e88', accent: '#00f0ff' }, f: { h: 'Orbitron', b: 'Space Mono' }, r: 4 },
		'cyber': { n: 'Cyberpunk', c: { bg: '#0d0221', surface: '#190535', text: '#c8f9ff', heading: '#f6f930', primary: '#fe00fe', accent: '#00fff5' }, f: { h: 'Audiowide', b: 'Rubik' }, r: 2 },
		'brutalist': { n: 'Brutalist', c: { bg: '#fffef0', surface: '#ffffff', text: '#111111', heading: '#000000', primary: '#000000', accent: '#ff4d00' }, f: { h: 'Archivo Black', b: 'Space Mono' }, r: 0 },
		'mono': { n: 'Monochrome', c: { bg: '#fafafa', surface: '#ffffff', text: '#404040', heading: '#111111', primary: '#111111', accent: '#777777' }, f: { h: 'Syne', b: 'Inter' }, r: 999 },
		'coffee': { n: 'Coffee', c: { bg: '#f7f1ea', surface: '#fffaf4', text: '#5c4033', heading: '#2b1a12', primary: '#8b5a2b', accent: '#c08552' }, f: { h: 'Merriweather', b: 'Lato' }, r: 10 }
	};
	var BTN_SEL = '.wp-block-button__link,.wp-element-button,input[type=submit],button[type=submit],.button,.btn,.elementor-button,.ms-btn-el:not(.ms-btn-ghost)';

	function themeCss(t, site) {
		var css = '';
		t = t || {}; site = site || {};
		if (t.id && t.c) {
			var c = t.c, ap = t.apply || {}, r = t.r == null ? 8 : t.r;
			css += ':root,body{--ms-bg:' + c.bg + ';--ms-surface:' + c.surface + ';--ms-text:' + c.text + ';--ms-heading:' + c.heading + ';--ms-primary:' + c.primary + ';--ms-accent:' + c.accent + ';--ms-radius:' + r + 'px' +
				(ap.colors !== false ? ';--wp--preset--color--base:' + c.bg + ' !important;--wp--preset--color--contrast:' + c.text + ' !important;--wp--preset--color--primary:' + c.primary + ' !important;--wp--preset--color--secondary:' + c.accent + ' !important;--wp--preset--color--accent:' + c.primary + ' !important' : '') + '}\n';
			if (ap.colors !== false) css += 'body{background-color:' + c.bg + ' !important;color:' + c.text + ' !important}h1,h2,h3,h4,h5,h6{color:' + c.heading + ' !important}a{color:' + c.primary + '}.ms-card{background:' + c.surface + '}\n';
			if (ap.fonts !== false && t.f) {
				if (t.f.b) css += 'body,p,li,input,textarea,select,button{font-family:' + fontValue(t.f.b) + ' !important}';
				if (t.f.h) css += 'h1,h2,h3,h4,h5,h6{font-family:' + fontValue(t.f.h) + ' !important}\n';
			}
			if (ap.buttons !== false) {
				css += BTN_SEL + '{background:' + c.primary + ' !important;color:' + (c.onPrimary || '#fff') + ' !important;border-radius:' + r + 'px !important;border:0 !important;transition:transform .2s,filter .2s,box-shadow .2s}' +
					BTN_SEL.split(',').map(function (x) { return x + ':hover'; }).join(',') + '{filter:brightness(1.08);transform:translateY(-2px);box-shadow:0 12px 26px -12px ' + c.primary + '}\n';
			}
		}
		if (site.smooth) css += 'html{scroll-behavior:smooth}\n';
		if (site.selection) css += '::selection{background:' + site.selection + ';color:#fff}\n';
		if (site.pageFade) css += 'body{animation:ms-page-in .7s ease both}\n';
		if (site.scrollbar) css += 'html{scrollbar-color:' + site.scrollbar + ' transparent}\n';
		return css;
	}
	function themeFonts(t) {
		if (!t || !t.id || !t.f || (t.apply && t.apply.fonts === false)) return [];
		return [t.f.h, t.f.b].filter(function (n, i, a) { return n && FONT_MAP[n] && a.indexOf(n) === i; }).map(function (n) { return n + ':' + FONT_MAP[n][1]; });
	}

	/* Extra CSS a rule produces besides its plain style (frames, icons, hover, menu, header). */
	function ruleExtraCss(r) {
		var sel = r.selector, out = '';
		if (r.menu) {
			var m = r.menu;
			if (m.style && MENU_STYLES[m.style]) out += sel + '{--ms-acc:' + (m.accent || 'var(--ms-primary,#7c3aed)') + '}' + MENU_STYLES[m.style].css(sel) + '\n';
			else if (m.accent) out += sel + '{--ms-acc:' + m.accent + '}';
			if (m.color) out += sel + ' a{color:' + m.color + ' !important}';
			if (m.gap != null && m.gap !== '') out += sel + (/^(UL|OL)$/i.test(sel.split(' ').pop()) ? '' : '') + '{gap:' + m.gap + 'px !important}' + sel + ' ul{gap:' + m.gap + 'px !important}';
			if (m.upper) out += sel + ' a{text-transform:uppercase;letter-spacing:.08em}';
			if (m.size) out += sel + ' a{font-size:' + m.size + 'px !important}';
			if (m.mobileBg) out += sel + '{--ms-mm-bg:' + m.mobileBg + '}';
			out += '\n';
		}
		if (r.header) {
			var h = r.header;
			if (h.sticky) out += sel + '{position:sticky !important;top:0;z-index:999;transition:padding .3s,background-color .3s,box-shadow .3s,transform .35s}';
			if (h.shrink) out += 'body.ms-scrolled ' + sel + '{padding-top:6px !important;padding-bottom:6px !important;box-shadow:0 8px 30px -12px rgba(0,0,0,.25)}';
			if (h.blur) out += 'body.ms-scrolled ' + sel + '{background-color:' + (h.blurColor || 'rgba(255,255,255,.72)') + ' !important;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}';
			if (h.transparent) out += 'body:not(.ms-scrolled) ' + sel + '{background:transparent !important;box-shadow:none !important}';
			if (h.hide) out += 'body.ms-scroll-down ' + sel + '{transform:translateY(-110%)}' + sel + '{transition:transform .35s ease,padding .3s,background-color .3s}';
			out += '\n';
		}
		if (r.logo) {
			var lg = r.logo, okc = function (c) { return /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i.test(c || ''); }, nn = function (v) { return isFinite(parseFloat(v)) ? parseFloat(v) : null; };
			if (lg.mode === 'image') out += sel + ' .ms-logo-text{display:none !important}';
			if (lg.mode === 'text') out += sel + ' img{display:none !important}';
			if (nn(lg.size) != null) out += sel + ' img{height:' + nn(lg.size) + 'px !important;width:auto !important;max-width:none}';
			if (nn(lg.gap) != null) out += sel + '{gap:' + nn(lg.gap) + 'px}';
			if (nn(lg.textSize) != null) out += sel + ' .ms-logo-text{font-size:' + nn(lg.textSize) + 'px}';
			if (okc(lg.color)) out += sel + ' .ms-logo-text{color:' + lg.color + ' !important}';
			if (nn(lg.round) != null) out += sel + ' img{border-radius:' + nn(lg.round) + '% !important}';
			out += '\n';
		}
		if (r.style && r.style.hover && Object.keys(r.style.hover).length) out += sel + ':hover,' + sel + '.ms-force-hover{' + decls(r.style.hover) + '}\n';
		return out;
	}
	function ruleBaseDecls(r) {
		var d = {};
		if (r.frame && FRAMES[r.frame]) Object.assign(d, FRAMES[r.frame].css);
		if (r.icon && ICON_PATHS[r.icon]) d['--ms-icon'] = iconUri(r.icon);
		return d;
	}

	/* ==================================================================
	 * 2. STATE & HELPERS
	 * ================================================================== */

	var S = {
		key: '', title: '', url: '',
		page: { rules: [], ops: [], connectors: [] }, global: { rules: [], ops: [], connectors: [], theme: {}, site: {} }, globalDirty: false,
		el: null, sel: '', hov: null,
		device: 'desktop', tab: 'edit',
		undo: [], redo: [], lastHistKey: '', lastHistTime: 0,
		dirty: false, layout: false, snap: true, interact: false, clip: null, editing: null,
		state: 'normal', view: 'element', drawer: false, dtab: 'elements', connecting: null, picking: null, media: null
	};
	var FR, FW, FD, RT; // iframe, its window, document, runtime
	var UI = {};

	function $(sel, root) { return (root || document).querySelector(sel); }
	function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
	function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
	function clone(o) { return JSON.parse(JSON.stringify(o)); }
	function uid() { return 'r' + Math.random().toString(36).slice(2, 9); }
	function title(s) { return String(s).replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }
	function pget(o, path) { return path.split('.').reduce(function (a, k) { return a == null ? undefined : a[k]; }, o); }
	function pset(o, path, v) {
		var ks = path.split('.'), last = ks.pop();
		ks.forEach(function (k) { o = o[k] = (o[k] && typeof o[k] === 'object') ? o[k] : {}; });
		if (v === '' || v == null) delete o[last]; else o[last] = v;
	}
	function len(v) { v = String(v == null ? '' : v).trim(); return /^-?\d+(\.\d+)?$/.test(v) ? v + 'px' : v; }
	function fq(sel) { try { return Array.prototype.slice.call(FD.querySelectorAll(sel)); } catch (e) { return []; } }

	function toast(msg, type, action) {
		var t = document.createElement('div');
		t.className = 'ms-toast ' + (type || '');
		t.setAttribute('role', 'status');
		var span = document.createElement('span'); span.textContent = msg; t.appendChild(span);
		if (action) {
			var b = document.createElement('button'); b.type = 'button'; b.textContent = action.label;
			b.addEventListener('click', function () { t.remove(); action.fn(); });
			t.appendChild(b);
		}
		UI.toasts.appendChild(t);
		while (UI.toasts.children.length > 3) UI.toasts.firstChild.remove();
		var life = action ? 5500 : 2800;
		setTimeout(function () { t.classList.add('out'); }, life);
		setTimeout(function () { t.remove(); }, life + 500);
	}
	var UNDO = { label: 'Undo', fn: function () { ACTIONS.undo(); } };

	/* ---------- rules ---------- */
	function allRules() { return S.global.rules.concat(S.page.rules); }
	function findRule(sel) {
		return S.page.rules.filter(function (r) { return r.selector === sel; })[0] ||
			S.global.rules.filter(function (r) { return r.selector === sel; })[0] || null;
	}
	function ensureRuleFor(sel, label) {
		var r = findRule(sel);
		if (!r) {
			r = { id: uid(), selector: sel, label: label || '', scope: 'page' };
			S.page.rules.push(r);
		}
		return r;
	}
	function rule() { return S.sel ? findRule(S.sel) : null; }
	function ruleE() { return ensureRuleFor(S.sel, S.el ? friendly(S.el) : ''); }
	function exactSel() { return S.el ? cssPath(S.el) : S.sel; }
	function markDirty(r) {
		S.dirty = true;
		if (r && r.scope === 'global') S.globalDirty = true;
		UI.save.classList.add('dirty');
		queueDraft();
	}
	function isEmptyRule(r) {
		var st = r.style || {};
		var hasStyle = ['desktop', 'tablet', 'mobile', 'hover'].some(function (d) { return st[d] && Object.keys(st[d]).length; });
		var hasContent = r.content && Object.keys(r.content).length;
		var has = function (k) { return r[k] && (typeof r[k] !== 'object' || Object.keys(r[k]).some(function (x) { return r[k][x] !== '' && r[k][x] != null && r[k][x] !== false; })); };
		return !(hasStyle || hasContent || r.frame || r.icon || has('link') || has('menu') || has('header') || has('popup') || has('countdown') || has('video') || has('search') || has('logo') || (r.text && r.text.preset) || (r.anim && (r.anim.in || r.anim.out)) ||
			(r.loop && r.loop.type) || (r.fx && r.fx.list && r.fx.list.length));
	}

	/* style get/set (device aware, cascading desktop → tablet → mobile) */
	var DEV_ORDER = ['desktop', 'tablet', 'mobile'];
	function curDev() { return S.state === 'hover' ? 'hover' : S.device; }
	function sOwn(r, prop, dev) { dev = dev || curDev(); return r && r.style && r.style[dev] ? r.style[dev][prop] : undefined; }
	function sEff(r, prop) {
		if (S.state === 'hover') return sOwn(r, prop, 'hover');
		var v;
		for (var i = 0; i <= DEV_ORDER.indexOf(S.device); i++) { var x = sOwn(r, prop, DEV_ORDER[i]); if (x != null && x !== '') v = x; }
		return v;
	}
	function sSet(r, prop, val, dev) {
		dev = dev || curDev();
		r.style = r.style || {};
		var d = r.style[dev] = r.style[dev] || {};
		if (val === '' || val == null) delete d[prop]; else d[prop] = String(val);
	}

	/* ---------- CSS generation ---------- */
	function decls(o) {
		return Object.keys(o).map(function (p) { return p + ':' + o[p] + (NO_IMPORTANT[p] ? '' : ' !important'); }).join(';');
	}
	function genCss(rules) {
		var base = '', tab = '', mob = '', flash = '';
		rules.forEach(function (r) {
			var st = r.style || {}, sel = r.selector;
			var d = ruleBaseDecls(r);
			if (r.text && r.text.preset && TEXT_PRESETS[r.text.preset]) Object.assign(d, TEXT_PRESETS[r.text.preset].css);
			Object.assign(d, st.desktop || {});
			if (Object.keys(d).length) base += sel + '{' + decls(d) + '}\n';
			if (st.tablet && Object.keys(st.tablet).length) tab += sel + '{' + decls(st.tablet) + '}\n';
			if (st.mobile && Object.keys(st.mobile).length) mob += sel + '{' + decls(st.mobile) + '}\n';
			base += ruleExtraCss(r);
			var a = r.anim;
			if (a && a.in && (!a.trigger || a.trigger === 'scroll' || a.trigger === 'load')) {
				var split = a.split && a.split !== 'none';
				flash += 'html.ms-js ' + sel + ((a.stagger > 0 && !split && a.in !== 'typewriter') ? '>*' : '') + '{opacity:0}\n';
			}
		});
		var css = base;
		if (tab) css += MQ.tablet + '{\n' + tab + '}\n';
		if (mob) css += MQ.mobile + '{\n' + mob + '}\n';
		return css + flash;
	}
	function collectFonts(rules) {
		var out = {};
		rules.forEach(function (r) {
			var names = [];
			if (r.text && r.text.preset && TEXT_PRESETS[r.text.preset] && TEXT_PRESETS[r.text.preset].font) names.push(TEXT_PRESETS[r.text.preset].font);
			DEV_ORDER.forEach(function (d) {
				var ff = r.style && r.style[d] && r.style[d]['font-family'];
				if (ff) names.push(ff.split(',')[0].replace(/['"]/g, '').trim());
			});
			names.forEach(function (n) { if (FONT_MAP[n]) out[n] = n + ':' + FONT_MAP[n][1]; });
		});
		return Object.keys(out).map(function (k) { return out[k]; });
	}
	function fontsUrl(list) {
		if (!list.length) return '';
		return 'https://fonts.googleapis.com/css2?' + list.map(function (f) {
			var p = f.split(':'); return 'family=' + p[0].replace(/ /g, '+') + ':wght@' + p[1];
		}).join('&') + '&display=swap';
	}
	function loadFonts(doc, list) {
		list.forEach(function (f) {
			var id = 'ms-font-' + f.split(':')[0].replace(/\W/g, '');
			if (doc.getElementById(id)) return;
			var l = doc.createElement('link');
			l.id = id; l.rel = 'stylesheet'; l.href = fontsUrl([f]);
			doc.head.appendChild(l);
		});
	}

	function updateCss() {
		if (!FD) return;
		var st = FD.getElementById('ms-live');
		var rules = allRules();
		st.textContent = themeCss(S.global.theme, S.global.site) + genCss(rules);
		loadFonts(FD, collectFonts(rules).concat(themeFonts(S.global.theme)));
	}

	/* ---------- selectors & element info ---------- */
	var ID_OK = /^[A-Za-z][\w-]*$/;
	function isOurs(el) { return !el || el.nodeType !== 1 || !!(el.closest && el.closest('#ms-ov')); }
	function goodId(el) {
		if (!el.id || !ID_OK.test(el.id) || /^ms-/.test(el.id)) return false;
		try { return FD.querySelectorAll('#' + el.id).length === 1; } catch (e) { return false; }
	}
	function cssPath(el) {
		if (goodId(el)) return '#' + el.id;
		var parts = [];
		while (el && el.nodeType === 1 && el !== FD.body && el !== FD.documentElement) {
			if (goodId(el)) { parts.unshift('#' + el.id); break; }
			var tag = el.tagName.toLowerCase(), n = 1, same = false, sib = el;
			while ((sib = sib.previousElementSibling)) { if (sib.tagName === el.tagName) { n++; same = true; } }
			sib = el;
			while (!same && (sib = sib.nextElementSibling)) { if (sib.tagName === el.tagName && !isOurs(sib)) same = true; }
			parts.unshift(same ? tag + ':nth-of-type(' + n + ')' : tag);
			el = el.parentElement;
		}
		if (parts[0] && parts[0].charAt(0) !== '#') parts.unshift('body');
		return parts.join(' > ');
	}
	var BAD_CLASS = /^(ms-|is-|has-|wp-image-|post-\d|page-item-\d|menu-item-\d|current|active|focus|hover|elementor-element-|lazy|loaded|aos)/;
	function similarSel(el) {
		var tag = el.tagName.toLowerCase();
		var cls = Array.prototype.slice.call(el.classList).filter(function (c) { return !BAD_CLASS.test(c) && /^[A-Za-z_][\w-]*$/.test(c); }).slice(0, 2);
		if (cls.length) return tag + '.' + cls.join('.');
		var p = el.parentElement;
		return p && p !== FD.body ? cssPath(p) + ' > ' + tag : tag;
	}
	function friendly(el) {
		var t = el.tagName, cls = (el.className && el.className.baseVal == null ? el.className : '') || '';
		if (/^H[1-6]$/.test(t)) return 'Heading ' + t.charAt(1);
		if (t === 'IMG') return 'Image';
		if (t === 'P') return 'Paragraph';
		if (t === 'NAV' || /navigation|menu/.test(cls) && t !== 'LI' && t !== 'A') return 'Menu';
		if (t === 'LI' && el.closest('nav,.menu')) return 'Menu item';
		if ((t === 'A' || t === 'BUTTON') && /btn|button/.test(cls + ' ' + (el.parentElement && el.parentElement.className))) return 'Button';
		if (t === 'BUTTON') return 'Button';
		if (t === 'A') return 'Link';
		if (t === 'HEADER' || /site-header/.test(cls)) return 'Header';
		if (t === 'FOOTER' || /site-footer/.test(cls)) return 'Footer';
		if (el.querySelector && el.querySelector('h1') && el.offsetHeight > 280) return 'Hero section';
		if (t === 'SECTION') return 'Section';
		if (t === 'UL' || t === 'OL') return 'List';
		if (t === 'FIGURE') return 'Figure';
		if (t === 'VIDEO') return 'Video';
		if (t === 'FORM') return 'Form';
		if (t === 'SPAN' || t === 'STRONG' || t === 'EM') return 'Text';
		return 'Block';
	}
	function isTextish(el) { return el && !/^(IMG|VIDEO|IFRAME|INPUT|SELECT|TEXTAREA|SVG|CANVAS|HR|BR)$/.test(el.tagName); }

	/* ==================================================================
	 * 3. SHELL, IFRAME, OVERLAY, SELECTION, DRAG/RESIZE
	 * ================================================================== */

	var FRAME_CSS = [
		'#ms-ov{position:fixed;inset:0;pointer-events:none;z-index:2147483646}',
		'#ms-ov .ms-hov,#ms-ov .ms-selbox{position:fixed;display:none;box-sizing:border-box}',
		'#ms-ov .ms-hov{border:1.5px dashed #a78bfa;background:rgba(139,92,246,.06)}',
		'#ms-ov .ms-selbox{outline:2px solid #7c3aed;outline-offset:0}',
		'#ms-ov .ms-lbl{position:absolute;left:-2px;top:-21px;background:#8b5cf6;color:#fff;font:600 11px/19px system-ui,sans-serif;padding:0 7px;border-radius:4px 4px 0 0;white-space:nowrap}',
		'#ms-ov .ms-selbox .ms-lbl{background:#7c3aed}',
		'#ms-ov .ms-lbl.in{top:0;border-radius:0 0 4px 0}',
		'#ms-ov .ms-h{position:absolute;width:11px;height:11px;background:#fff;border:2px solid #7c3aed;border-radius:3px;pointer-events:auto;display:none;box-sizing:border-box}',
		'#ms-ov .ms-move{position:absolute;right:-2px;top:-24px;height:22px;padding:0 8px;background:#7c3aed;color:#fff;font:600 11px/22px system-ui,sans-serif;border-radius:4px 4px 0 0;cursor:move;pointer-events:auto;display:none}',
		'#ms-ov.ms-layout .ms-h,#ms-ov.ms-layout .ms-move{display:block}',
		'#ms-ov .ms-h[data-h=n]{top:-6px;left:calc(50% - 5px);cursor:ns-resize}#ms-ov .ms-h[data-h=s]{bottom:-6px;left:calc(50% - 5px);cursor:ns-resize}',
		'#ms-ov .ms-h[data-h=e]{right:-6px;top:calc(50% - 5px);cursor:ew-resize}#ms-ov .ms-h[data-h=w]{left:-6px;top:calc(50% - 5px);cursor:ew-resize}',
		'#ms-ov .ms-h[data-h=ne]{right:-6px;top:-6px;cursor:nesw-resize}#ms-ov .ms-h[data-h=nw]{left:-6px;top:-6px;cursor:nwse-resize}',
		'#ms-ov .ms-h[data-h=se]{right:-6px;bottom:-6px;cursor:nwse-resize}#ms-ov .ms-h[data-h=sw]{left:-6px;bottom:-6px;cursor:nesw-resize}',
		'#ms-ov .ms-dim{position:absolute;left:50%;bottom:-24px;transform:translateX(-50%);background:#111;color:#fff;font:11px/18px system-ui;padding:0 6px;border-radius:3px;display:none;white-space:nowrap}',
		'#ms-ov.ms-dragging .ms-dim{display:block}',
		'html.ms-editing a,html.ms-editing button,html.ms-editing input[type=submit]{cursor:default!important}',
		'html.ms-editing [contenteditable=true]{outline:2px solid #22c55e!important;outline-offset:2px;cursor:text!important}',
		'html.ms-dragging-doc,html.ms-dragging-doc *{user-select:none!important;cursor:grabbing!important}',
		'#ms-ov .ms-qbar{position:absolute;left:-2px;top:-60px;display:flex;align-items:center;gap:1px;pointer-events:auto;background:#fff;border-radius:11px;padding:4px;box-shadow:0 0 0 1px rgba(16,24,40,.08),0 10px 28px -6px rgba(16,24,40,.35);white-space:nowrap;font:600 12px/1 Inter,system-ui,sans-serif}',
		'#ms-ov .ms-qbar.below{top:auto;bottom:-46px}#ms-ov .ms-qbar.inside{top:8px;left:8px}',
		'#ms-ov .ms-qbar button{all:unset;cursor:pointer;color:#2b2f40;height:30px;min-width:30px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 9px;border-radius:7px;box-sizing:border-box}',
		'#ms-ov .ms-qbar button:hover{background:#f3edff;color:#6d28d9}#ms-ov .ms-qbar button.ms-q-main{color:#6d28d9}',
		'#ms-ov .ms-qbar button[data-q=grab]{cursor:grab}#ms-ov .ms-qbar button[data-q=del]:hover{background:#fee2e2;color:#dc2626}',
		'#ms-ov .ms-qbar i{width:1px;height:20px;background:#e5e7ef;margin:0 3px}',
		'#ms-ov .ms-qbar svg{width:16px;height:16px;flex:none}',
		'#ms-ov .ms-hov .ms-lbl::after{content:" · click to edit";opacity:.75;font-weight:500}',
		'#ms-ov .ms-drop-line{position:fixed;display:none;background:#22c55e;box-shadow:0 0 0 2px rgba(34,197,94,.3),0 0 12px rgba(34,197,94,.7);border-radius:3px;z-index:3}',
		'#ms-ov .ms-drop-box{position:fixed;display:none;outline:2px dashed #22c55e;background:rgba(34,197,94,.08);z-index:2}',
		'#ms-ov .ms-drop-box span,#ms-ov .ms-drop-line span{position:absolute;left:0;top:-20px;background:#22c55e;color:#fff;font:600 11px/18px system-ui,sans-serif;padding:0 6px;border-radius:4px;white-space:nowrap}',
		'#ms-ov .ms-drag-ghost{position:fixed;display:none;pointer-events:none;background:#111;color:#fff;font:600 12px/26px system-ui,sans-serif;padding:0 10px;border-radius:6px;opacity:.9;z-index:4;transform:translate(12px,12px)}',
		'html.ms-mode-pick,html.ms-mode-pick *{cursor:crosshair!important}',
		'html.ms-editing .ms-popup{position:relative!important;display:grid!important;inset:auto!important;z-index:auto!important;min-height:340px;border-radius:12px;outline:2px dashed rgba(124,58,237,.6);outline-offset:-2px}',
		'html.ms-editing .ms-popup::before{content:"Popup (hidden until opened – use Link tab: Open popup)";position:absolute;top:8px;left:12px;color:#fff;font:600 11px system-ui,sans-serif;opacity:.8}',
		'html.ms-filedrag body{outline:4px dashed #22c55e;outline-offset:-4px}'
	].join('\n');

	var ICONS = {
		plus: '<path d="M12 5v14M5 12h14"/>', droplet: '<path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/>',
		undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 010 11H11"/>', redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 000 11H13"/>',
		eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
		monitor: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>', tablet: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M11 18h2"/>',
		phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>', check: '<path d="M5 12.5l4.5 4.5L19 7"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
		more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
		sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
		pencil: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>', play: '<path d="M7 4.5v15l12.5-7.5z"/>',
		wand: '<path d="M4 20L15 9"/><path d="M15 4v3M19.5 8.5h-3M18 5l-2 2M20 11l-1.5-.5M12 3l.5 1.5"/>', type: '<path d="M4 7V5h16v2M12 5v14M9 19h6"/>',
		layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
		link: '<path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1-1"/>',
		up: '<path d="M12 19V5M6 11l6-6 6 6"/>', down: '<path d="M12 5v14M6 13l6 6 6-6"/>', chevup: '<path d="M6 15l6-6 6 6"/>',
		copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/>',
		trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', grip: '<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>',
		image: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/>',
		search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>', help: '<circle cx="12" cy="12" r="9.5"/><path d="M9.5 9.3a2.6 2.6 0 015 .7c0 1.7-2.5 2.2-2.5 3.8M12 17h.01"/>',
		moon: '<path d="M20.5 13.3A8.5 8.5 0 1110.7 3.5a6.6 6.6 0 009.8 9.8z"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
		replay: '<path d="M3 12a9 9 0 0115.4-6.4L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-15.4 6.4L3 16"/><path d="M3 21v-5h5"/>',
		exit: '<path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>', cursor: '<path d="M5 3l14 7-6 2-2 6z"/>',
		clipboard: '<rect x="8" y="3" width="8" height="4" rx="1"/><path d="M8 5H6a2 2 0 00-2 2v13a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>',
		reset: '<path d="M3 12a9 9 0 109-9 9.2 9.2 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/>', keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
		frame: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>', home: '<path d="M3 11l9-8 9 8M5 9.5V20h14V9.5"/>',
		alignl: '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>', alignc: '<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>', alignr: '<path d="M4 6h16M10 10h10M4 14h16M10 18h10"/>', alignj: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>'
	};
	var ICON_ALIAS = { 'plus-alt2': 'plus', desktop: 'monitor', smartphone: 'phone', 'controls-repeat': 'replay', visibility: 'eye', saved: 'check', 'no-alt': 'x',
		edit: 'pencil', 'controls-play': 'play', superhero: 'wand', 'editor-textcolor': 'type', 'admin-links': 'link', 'arrow-up-alt': 'chevup', 'admin-page': 'copy',
		'image-rotate': 'reset', 'admin-customizer': 'cursor', 'format-image': 'image', 'editor-alignleft': 'alignl', 'editor-aligncenter': 'alignc', 'editor-alignright': 'alignr', 'editor-justify': 'alignj' };
	function icon(name) {
		var n = ICON_ALIAS[name] || name;
		if (!ICONS[n]) return '<span class="dashicons dashicons-' + name + '"></span>';
		return '<svg class="ms-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[n] + '</svg>';
	}

	function buildShell() {
		var app = document.getElementById('ms-app');
		app.innerHTML =
			'<header class="ms-top">' +
				'<div class="ms-brand"><span class="ms-logo">✦</span><span>Motion Studio</span></div>' +
				'<button data-act="drawer" class="ms-addbtn" title="Add elements, sections, frames &amp; images  [A]">' + icon('plus') + '<span>Add</span></button>' +
				'<button data-act="theme" class="ms-themebtn" title="Site theme: colors, fonts &amp; extras">' + icon('droplet') + '<span class="ms-lbl-hide">Theme</span></button>' +
				'<button data-act="search" title="Search animations, effects, styles…  [Ctrl+K]">' + icon('search') + '</button>' +
				'<div class="ms-pagetitle"><span>Editing</span><b>…</b></div>' +
				'<div class="ms-devices" role="group" aria-label="Preview size">' +
					'<button data-dev="desktop" class="on" title="Desktop">' + icon('monitor') + '</button>' +
					'<button data-dev="tablet" title="Tablet – styles for ≤1024px">' + icon('tablet') + '</button>' +
					'<button data-dev="mobile" title="Phone – styles for ≤767px">' + icon('phone') + '</button>' +
				'</div>' +
				'<span class="ms-sep"></span>' +
				'<div class="ms-actions">' +
					'<button data-act="undo" title="Undo  [Ctrl+Z]">' + icon('undo') + '</button>' +
					'<button data-act="redo" title="Redo  [Ctrl+Y]">' + icon('redo') + '</button>' +
					'<button data-act="interact" title="Preview: use the page like a visitor (links, menus, popups)  [P]">' + icon('eye') + '<span class="ms-lbl-hide">Preview</span></button>' +
					'<span class="ms-status" aria-live="polite"></span>' +
					'<button data-act="save" class="ms-save" title="Save  [Ctrl+S]">' + icon('check') + '<span>Save</span></button>' +
					'<div class="ms-menu-wrap"><button data-act="menu" title="More">' + icon('more') + '</button>' +
						'<div class="ms-menu" role="menu">' +
							'<button data-act="auto">' + icon('sparkles') + 'Auto-animate this page</button>' +
							'<button data-act="replay">' + icon('replay') + 'Replay animations</button>' +
							'<button data-act="search">' + icon('search') + 'Search everything<kbd>Ctrl K</kbd></button>' +
							'<hr>' +
							'<button data-act="dark">' + icon('moon') + '<span class="ms-dark-lbl">Dark mode</span></button>' +
							'<button data-act="shortcuts">' + icon('keyboard') + 'Keyboard shortcuts<kbd>?</kbd></button>' +
							'<button data-act="welcome">' + icon('help') + 'Show the welcome guide</button>' +
							'<hr>' +
							'<button data-act="dashboard">' + icon('home') + 'Motion Studio dashboard</button>' +
							'<button data-act="exit">' + icon('exit') + 'Exit editor</button>' +
						'</div></div>' +
				'</div>' +
			'</header>' +
			'<div class="ms-main">' +
				'<aside class="ms-drawer" aria-label="Add to page">' +
					'<div class="ms-dhead"><b>Add to page</b><button data-act="drawer" title="Close  [A]">' + icon('x') + '</button></div>' +
					'<nav class="ms-dtabs">' +
					[['elements', 'Elements'], ['sections', 'Sections'], ['frames', 'Frames'], ['media', 'Images']].map(function (t) { return '<button data-dtab="' + t[0] + '">' + t[1] + '</button>'; }).join('') +
					'</nav><div class="ms-dsearch"><input type="search" data-dsearch placeholder="Search…" aria-label="Search the library"></div><div class="ms-dbody"></div></aside>' +
				'<div class="ms-canvas"><div class="ms-frame-wrap"><iframe id="ms-frame" title="Page preview"></iframe><div class="ms-loading">Loading your page…</div></div>' +
					'<div class="ms-canvas-hint">👆 <span><b>Click</b> anything to edit</span><span><b>Double-click</b> text to type</span><span><b>+ Add</b> to drag in new things</span></div></div>' +
				'<aside class="ms-panel ms-simple">' +
					'<div class="ms-head"></div>' +
					'<nav class="ms-tabs" role="tablist">' +
						['edit:pencil:Edit:Content, colors, background, borders', 'animate:play:Animate:Entrance, exit & loop animations', 'fx:wand:Effects:Glitch, glow, hover & interactive effects', 'text:type:Text:Text styles & typography', 'layout:layout:Layout:Move, resize, spacing & columns', 'link:link:Link:Links, actions & connecting lines'].map(function (t) {
							var p = t.split(':'); return '<button data-tab="' + p[0] + '" role="tab" title="' + p[3] + '">' + icon(p[1]) + '<span>' + p[2] + '</span></button>';
						}).join('') +
					'</nav>' +
					'<div class="ms-modebar"><span>Show options</span><div class="ms-mode"><button data-act="mode-simple" class="on">Simple</button><button data-act="mode-adv">Advanced</button></div></div>' +
					'<div class="ms-body"></div>' +
				'</aside>' +
			'</div>' +
			'<div class="ms-toasts"></div>';

		UI.top = $('.ms-top'); UI.title = $('.ms-pagetitle'); UI.wrap = $('.ms-frame-wrap'); UI.head = $('.ms-head');
		UI.body = $('.ms-body'); UI.tabs = $('.ms-tabs'); UI.toasts = $('.ms-toasts'); UI.save = $('.ms-status');
		UI.mode = $('.ms-modebar'); UI.panel = $('.ms-panel'); UI.hint = $('.ms-canvas-hint'); UI.menu = $('.ms-menu');
		UI.loading = $('.ms-loading'); UI.drawer = $('.ms-drawer'); UI.dbody = $('.ms-dbody');
		FR = $('#ms-frame');
		bindDrawer();

		UI.top.addEventListener('click', function (e) {
			var b = e.target.closest('button'); if (!b) return;
			if (b.closest('.ms-menu')) UI.menu.classList.remove('open');
			if (b.dataset.dev) setDevice(b.dataset.dev);
			if (b.dataset.act && ACTIONS[b.dataset.act]) ACTIONS[b.dataset.act](b);
		});
		UI.tabs.addEventListener('click', function (e) {
			var b = e.target.closest('[data-tab]'); if (!b) return;
			S.tab = b.dataset.tab; renderPanel();
		});
		bindPanel();
		document.addEventListener('keydown', onKey);
		window.addEventListener('beforeunload', function (e) { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });

		FR.addEventListener('load', onFrameLoad);
		FR.src = CFG.frameUrl;
		renderPanel();
	}

	function onFrameLoad() {
		try { FW = FR.contentWindow; FD = FR.contentDocument; } catch (e) { toast('Cannot access page (different domain?)', 'err'); return; }
		var data = FW.MS_DATA;
		if (!data || !data.frame) {
			// Navigated without the frame flag (e.g. a link) → reload in frame mode.
			var u = new URL(FW.location.href);
			if (u.origin === location.origin) { u.searchParams.set('ms_frame', '1'); FW.location.replace(u.toString()); }
			return;
		}
		RT = FW.MotionStudioRuntime;
		var u2 = new URL(FW.location.href); u2.searchParams.delete('ms_frame');
		if (data.pageKey !== S.key) {
			S.key = data.pageKey; S.title = data.title; S.url = u2.toString();
			S.page = normalize(data.page); S.global = normalize(data.global);
			S.undo = []; S.redo = []; S.dirty = false; S.globalDirty = false;
			UI.save.classList.remove('dirty');
			setTimeout(offerDraft, 400);
		}
		UI.title.querySelector('b').textContent = S.title;
		UI.title.title = S.url;
		S.el = null; S.hov = null;

		var st = FD.createElement('style'); st.id = 'ms-frame-css'; st.textContent = FRAME_CSS; FD.head.appendChild(st);
		var live = FD.createElement('style'); live.id = 'ms-live'; FD.head.appendChild(live);
		FD.documentElement.classList.add('ms-editing');
		buildOverlay();
		bindFrame();
		RT.applyOps(allOps());
		updateCss();
		RT.initWidgets(FD);
		RT.applyAll(allRules());
		RT.setConnectors(allConns());
		RT.setSite(S.global.site);
		bindFileDrop();
		UI.loading.style.display = 'none';
		if (S.sel) { S.el = fq(S.sel)[0] || null; if (!S.el) S.sel = ''; }
		if (S.reloadScroll != null) { FW.scrollTo(0, S.reloadScroll); S.reloadScroll = null; }
		renderPanel();
	}

	function normalize(d) {
		d = d || {}; var rules = Array.isArray(d.rules) ? d.rules : [];
		rules.forEach(function (r) {
			// PHP turns empty objects into [] – fix them up.
			['style', 'content', 'anim', 'loop', 'fx', 'text'].forEach(function (k) { if (Array.isArray(r[k])) r[k] = {}; });
			if (r.style) DEV_ORDER.forEach(function (dv) { if (Array.isArray(r.style[dv])) r.style[dv] = {}; });
			if (r.fx && r.fx.list && !Array.isArray(r.fx.list)) r.fx.list = Object.values(r.fx.list);
			['link', 'menu', 'header', 'popup', 'countdown', 'video', 'search', 'logo'].forEach(function (k) { if (Array.isArray(r[k])) delete r[k]; });
		});
		var obj = function (v) { return v && !Array.isArray(v) && typeof v === 'object' ? v : {}; };
		return { rules: rules, ops: Array.isArray(d.ops) ? d.ops : [], connectors: Array.isArray(d.connectors) ? d.connectors : [], theme: obj(d.theme), site: obj(d.site) };
	}

	/* ---------- overlay ---------- */
	function buildOverlay() {
		var ov = FD.createElement('div');
		ov.id = 'ms-ov';
		ov.innerHTML = '<div class="ms-hov"><span class="ms-lbl"></span></div>' +
			'<div class="ms-selbox"><span class="ms-lbl"></span><div class="ms-move" data-h="move">✥ drag</div>' +
			['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map(function (h) { return '<div class="ms-h" data-h="' + h + '"></div>'; }).join('') +
			'<div class="ms-dim"></div>' +
			'<div class="ms-qbar" role="toolbar"></div></div>' +
			'<div class="ms-drop-line"><span></span></div><div class="ms-drop-box"><span></span></div><div class="ms-drag-ghost"></div>';
		FD.body.appendChild(ov);
		UI.ov = ov; UI.hov = $('.ms-hov', ov); UI.sbox = $('.ms-selbox', ov); UI.qbar = $('.ms-qbar', ov);
		UI.dline = $('.ms-drop-line', ov); UI.dbox = $('.ms-drop-box', ov); UI.ghost = $('.ms-drag-ghost', ov);
		ov.classList.toggle('ms-layout', S.layout);
		requestAnimationFrame(tick);
	}

	function place(box, el, label) {
		if (!el || !el.isConnected || S.interact) { box.style.display = 'none'; return; }
		var r = el.getBoundingClientRect();
		box.style.display = 'block';
		box.style.left = r.left + 'px'; box.style.top = r.top + 'px';
		box.style.width = Math.max(r.width, 2) + 'px'; box.style.height = Math.max(r.height, 2) + 'px';
		var lbl = box.firstChild;
		if (label != null && lbl.textContent !== label) lbl.textContent = label;
		lbl.classList.toggle('in', r.top < 22);
	}

	function tick() {
		if (!FD || !UI.ov || !UI.ov.isConnected) return;
		if (S.sel && (!S.el || !S.el.isConnected)) S.el = fq(S.sel)[0] || null;
		place(UI.sbox, S.el, S.el ? friendly(S.el) + (fq(S.sel).length > 1 ? ' ×' + fq(S.sel).length : '') : '');
		place(UI.hov, S.hov !== S.el ? S.hov : null, S.hov ? friendly(S.hov) + ' · ' + S.hov.tagName.toLowerCase() : '');
		if (S.el && UI.qbar) {
			var rb = S.el.getBoundingClientRect(), nearTop = rb.top < 66, nearBottom = rb.bottom > FW.innerHeight - 50;
			UI.qbar.classList.toggle('below', nearTop && !nearBottom);
			UI.qbar.classList.toggle('inside', nearTop && nearBottom);
		}
		requestAnimationFrame(tick);
	}

	/* ---------- frame events ---------- */
	function bindFrame() {
		FD.addEventListener('mouseover', function (e) {
			if (S.interact || S.drag) return;
			var t = e.target; if (isOurs(t) || t === FD.body || t === FD.documentElement) { S.hov = null; return; }
			S.hov = t;
		}, true);
		FD.addEventListener('mouseleave', function () { S.hov = null; });
		FD.documentElement.addEventListener('mouseleave', function () { S.hov = null; });

		FD.addEventListener('click', function (e) {
			var t = e.target;
			if (S.interact) {
				var a = t.closest && t.closest('a[href]');
				if (a && S.dirty && !a.target && a.origin === location.origin) {
					e.preventDefault();
					ask({ title: 'Unsaved changes', text: 'Save your changes before opening another page?', ok: 'Save & continue', alt: 'Don’t save', cancel: 'Stay here' }).then(function (r) {
						if (r === 1) save().then(function () { FW.location.href = a.href; });
						else if (r === 2) { S.dirty = false; FW.location.href = a.href; }
					});
				}
				return;
			}
			if (t.isContentEditable) return;
			if (isOurs(t)) { var q = t.closest('[data-q]'); if (q) { e.preventDefault(); e.stopPropagation(); quickAction(q.dataset.q); } return; }
			e.preventDefault(); e.stopPropagation();
			if (t === FD.body || t === FD.documentElement) return;
			if (t.tagName === 'MS-BLOCK') t = t.firstElementChild || t;
			if (S.connecting || S.picking) { finishPick(t); return; }
			select(t);
		}, true);

		FD.addEventListener('dblclick', function (e) {
			if (S.interact || isOurs(e.target)) return;
			e.preventDefault();
			var t = e.target;
			if (t.matches('.ms-frame') && t.querySelector('img')) t = t.querySelector('img');
			if (t.tagName === 'IMG') { select(t); pickMedia(function (m) { setContent('src', m.url); if (m.alt) setContent('alt', m.alt); renderPanel(); }); }
			else if (isTextish(t)) { select(t); startInlineEdit(t); }
		}, true);

		FD.addEventListener('submit', function (e) { if (!S.interact) e.preventDefault(); }, true);
		FD.addEventListener('keydown', onKey);
		FD.addEventListener('mousedown', onDragStart, true);
	}

	function select(el, keepTab) {
		finishInlineEdit();
		if (el && el.tagName === 'MS-BLOCK') el = el.firstElementChild || el.parentElement;
		S.view = 'element';
		S.el = el;
		var exact = cssPath(el);
		// Prefer an existing rule that already targets this element (e.g. an "all similar" rule).
		var matched = findRule(exact) ? null : allRules().filter(function (r) { try { return el.matches(r.selector); } catch (e) { return false; } }).pop();
		S.sel = matched ? matched.selector : exact;
		if (!keepTab && el.tagName === 'IMG' && S.tab === 'text') S.tab = 'edit';
		forceHover();
		renderPanel();
	}
	function deselect() { finishInlineEdit(); S.el = null; S.sel = ''; renderPanel(); }

	/* ---------- inline text editing ---------- */
	function startInlineEdit(el) {
		if (S.editing === el) return;
		finishInlineEdit();
		var r = findRule(cssPath(el));
		if (r) RT.cleanup(el); // un-split text, stop FX that change text
		S.editing = el;
		el._msBefore = el.innerHTML;
		el.contentEditable = 'true';
		el.focus();
		el.addEventListener('blur', finishInlineEdit, { once: true });
		toast('Editing text – click outside or press Esc to finish');
	}
	function finishInlineEdit() {
		var el = S.editing; if (!el) return;
		S.editing = null;
		el.removeAttribute('contenteditable');
		var html = el.innerHTML;
		if (html !== el._msBefore) {
			pushHistory('inline');
			var r = ensureRuleFor(cssPath(el), friendly(el));
			if (el._msOrigHTML == null) el._msOrigHTML = el._msBefore;
			r.content = r.content || {}; r.content.html = html;
			markDirty(r);
		}
		var rr = findRule(cssPath(el)); if (rr) RT.applyRuleTo(el, rr);
		if (S.tab === 'edit') renderPanel();
	}

	/* ---------- drag & resize ---------- */
	function parseTranslate(v) {
		if (!v || v === 'none') return [0, 0];
		var p = String(v).split(/\s+/); return [parseFloat(p[0]) || 0, parseFloat(p[1]) || 0];
	}
	function onDragStart(e) {
		var g = e.target.closest && e.target.closest('#ms-ov [data-q=grab]');
		if (g && S.el && e.button === 0) { e.preventDefault(); e.stopPropagation(); startReorder(e); return; }
		var h = e.target.closest && e.target.closest('#ms-ov [data-h]');
		if (!h || !S.el || e.button !== 0) return;
		e.preventDefault(); e.stopPropagation();
		pushHistory('drag');
		var r = ruleE(), rect = S.el.getBoundingClientRect(), t = parseTranslate(sEff(r, 'translate'));
		if (h.dataset.h !== 'move' && FW.getComputedStyle(S.el).display === 'inline') sSet(r, 'display', 'inline-block');
		S.drag = { h: h.dataset.h, x: e.clientX, y: e.clientY, tx: t[0], ty: t[1], w: rect.width, hgt: rect.height, r: r };
		UI.ov.classList.add('ms-dragging'); FD.documentElement.classList.add('ms-dragging-doc');
		FD.addEventListener('mousemove', onDragMove, true);
		FD.addEventListener('mouseup', onDragEnd, true);
	}
	function snap(v) { return S.snap ? Math.round(v / 10) * 10 : Math.round(v); }
	function onDragMove(e) {
		var d = S.drag; if (!d) return;
		var dx = e.clientX - d.x, dy = e.clientY - d.y, r = d.r, h = d.h, dim = $('.ms-dim', UI.ov);
		if (h === 'move') {
			var nx = snap(d.tx + dx), ny = snap(d.ty + dy);
			sSet(r, 'translate', nx + 'px ' + ny + 'px');
			dim.textContent = 'x ' + nx + '  y ' + ny;
		} else {
			var w = d.w, hh = d.hgt, tx = d.tx, ty = d.ty;
			if (h.indexOf('e') > -1) w = d.w + dx;
			if (h.indexOf('w') > -1) { w = d.w - dx; tx = d.tx + dx; }
			if (h.indexOf('s') > -1) hh = d.hgt + dy;
			if (h.indexOf('n') > -1) { hh = d.hgt - dy; ty = d.ty + dy; }
			sSet(r, 'box-sizing', 'border-box');
			if (/[ew]/.test(h)) { sSet(r, 'width', snap(Math.max(10, w)) + 'px'); sSet(r, 'max-width', 'none'); }
			if (S.el.tagName === 'IMG' && h.length === 2) sSet(r, 'height', 'auto'); // corners keep image ratio
			else if (/[ns]/.test(h)) sSet(r, 'height', snap(Math.max(10, hh)) + 'px');
			if (/[nw]/.test(h)) sSet(r, 'translate', snap(tx) + 'px ' + snap(ty) + 'px');
			dim.textContent = Math.round(S.el.getBoundingClientRect().width) + ' × ' + Math.round(S.el.getBoundingClientRect().height);
		}
		updateCss();
	}
	function onDragEnd() {
		FD.removeEventListener('mousemove', onDragMove, true);
		FD.removeEventListener('mouseup', onDragEnd, true);
		UI.ov.classList.remove('ms-dragging'); FD.documentElement.classList.remove('ms-dragging-doc');
		if (S.drag) markDirty(S.drag.r);
		S.drag = null;
		syncValues();
	}

	function setDevice(dev) {
		S.device = dev;
		$$('.ms-devices button').forEach(function (b) { b.classList.toggle('on', b.dataset.dev === dev); });
		UI.wrap.style.width = DEVICES[dev];
		UI.wrap.classList.toggle('ms-dev-frame', dev !== 'desktop');
		renderPanel();
		if (dev !== 'desktop') toast('Now editing ' + dev + ' styles – desktop styles are inherited');
	}

	/* ==================================================================
	 * 4. PANEL – controls, binding, tabs
	 * ================================================================== */

	/* Friendlier wording + which controls count as "advanced" (hidden in Simple mode). */
	var ADV_ROWS = { 'Easing': 1, 'Distance': 1, 'Start when': 1, 'Blend mode': 1, 'Cursor': 1, 'Word spacing': 1, 'Text shadow': 1, 'Z-index': 1, 'Overflow': 1,
		'Rotate': 1, 'Scale': 1, 'Order': 1, 'Top': 1, 'Left': 1, 'Right': 1, 'Bottom': 1, 'Position': 1, 'Min height': 1, 'Max width': 1, 'Offset': 1, 'Wrap': 1,
		'Glass color': 1, 'Image URL': 1, 'Text / HTML': 1, 'Word spacing ': 1, 'Delay': 0 };
	var ADV_SECS = { 'Position & stacking': 1, 'Show / hide per device': 1, 'Flex / grid': 1 };
	var ALIAS = { 'Stagger children': 'One by one', 'Start when': 'Start point', 'Easing': 'Motion feel', 'Distance': 'Travel distance', 'Move X': 'Move →', 'Move Y': 'Move ↓', 'Line height': 'Line spacing', 'Letter spacing': 'Letter gap' };
	function secKey(t) { return String(t).replace(/<[^>]+>/g, '').replace(/\(\d+\)/, '').trim(); }
	function sec(title, body, open, extra) {
		var k = secKey(title), st = S.secState && S.secState[k];
		var isOpen = st != null ? st : open !== false;
		return '<details class="ms-sec' + (ADV_SECS[k] ? ' ms-adv' : '') + '" data-sec="' + esc(k) + '"' + (isOpen ? ' open' : '') + '><summary>' + title + (extra || '') + '</summary><div class="ms-sec-b">' + body + '</div></details>';
	}
	function row(label, inner, cls) {
		var adv = ADV_ROWS[label] ? ' ms-adv' : '';
		return '<div class="ms-row ' + (cls || '') + adv + '"><label>' + (ALIAS[label] || label) + '</label><div class="ms-ctl">' + inner + '</div></div>';
	}
	function cSelect(k, opts, ph, attrs) {
		return '<select data-k="' + k + '" ' + (attrs || '') + '><option value="">' + (ph || 'Default') + '</option>' +
			opts.map(function (o) { o = Array.isArray(o) ? o : [o, title(o)]; return '<option value="' + esc(o[0]) + '">' + esc(o[1]) + '</option>'; }).join('') + '</select>';
	}
	function cRange(k, min, max, step, unit, attrs) {
		var a = 'data-k="' + k + '" data-unit="' + (unit || '') + '" ' + (attrs || '');
		var lbl = unit || (/^r:(anim|loop)\.(duration|delay|stagger|outDelay|outDuration)$/.test(k) ? 'ms' : (k === 'r:popup.delay' ? 's' : ''));
		return '<div class="ms-range"><input type="range" min="' + min + '" max="' + max + '" step="' + step + '" ' + a + '><input type="number" class="ms-num" step="' + step + '" ' + a + '><em>' + lbl + '</em></div>';
	}
	var BASE_SWATCHES = ['#000000', '#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#7c3aed', '#ec4899'];
	function swatches() {
		var t = S.global.theme && S.global.theme.c, list = t ? [t.primary, t.accent] : [];
		return list.concat(BASE_SWATCHES).filter(function (c, i, a) { return c && a.indexOf(c) === i; }).slice(0, 9);
	}
	function cColor(k) {
		return '<div class="ms-color"><input type="color" data-k="' + k + '" data-color title="Pick any color"><input type="text" data-k="' + k + '" placeholder="#hex or rgba()"><button type="button" class="ms-x" data-clear="' + k + '" title="Clear">×</button></div>' +
			'<div class="ms-swatchrow" data-swk="' + k + '">' + swatches().map(function (c) { return '<button type="button" data-sw="' + c + '" style="background:' + c + '" title="' + c + '"></button>'; }).join('') +
			'<button type="button" class="none" data-sw="transparent" title="Transparent"></button></div>';
	}
	function cText(k, ph, attrs) { return '<input type="text" data-k="' + k + '" placeholder="' + esc(ph || '') + '" ' + (attrs || '') + '>'; }
	function cToggle(k, label, on, attrs) {
		return '<label class="ms-toggle"><input type="checkbox" data-k="' + k + '" data-on=\'' + esc(JSON.stringify(on === undefined ? true : on)) + '\' ' + (attrs || '') + '><span></span>' + label + '</label>';
	}
	function cTiles(k, items, opts) {
		opts = opts || {};
		return '<div class="ms-tiles ' + (opts.cls || '') + '" data-k="' + k + '"' + (opts.multi ? ' data-multi' : '') + '>' +
			items.map(function (it) {
				it = Array.isArray(it) ? it : [it, title(it)];
				var dot = /ms-(anim|fx)-tiles/.test(opts.cls || '') ? '<i class="ms-prev-dot"></i>' : '';
				return '<button type="button" data-v="' + esc(it[0]) + '" title="' + esc(it[2] || (/</.test(it[1]) ? title(it[0]) : it[1])) + '"' + (it[3] ? ' style="' + esc(it[3]) + '"' : '') + '>' + dot + it[1] + '</button>';
			}).join('') + '</div>';
	}
	function btn(act, label, cls, data) { return '<button type="button" class="ms-btn ' + (cls || '') + '" data-act="' + act + '" ' + (data || '') + '>' + label + '</button>'; }
	function hint(t) { return '<p class="ms-hint">' + t + '</p>'; }
	function styleStr(css) { return Object.keys(css).map(function (p) { return p + ':' + css[p]; }).join(';'); }

	/* ---------- value get / set ---------- */
	function getK(k) {
		var r = rule(), el = S.el;
		if (k.indexOf('s:') === 0) return sEff(r, k.slice(2));
		if (k.indexOf('c:') === 0) {
			var f = k.slice(2), er = findRule(exactSel());
			if (er && er.content && er.content[f] != null) return er.content[f];
			if (!el) return '';
			if (f === 'html') return el.innerHTML;
			if (f === 'target') return el.getAttribute('target') === '_blank' ? '_blank' : '';
			return el.getAttribute(f) || '';
		}
		if (k === 'tx' || k === 'ty') { var t = parseTranslate(sEff(r, 'translate')); return t[k === 'tx' ? 0 : 1]; }
		if (k === 'cols') { var m = /repeat\((\d+)/.exec(sEff(r, 'grid-template-columns') || ''); return m ? m[1] : ''; }
		if (k.indexOf('hide:') === 0) return sOwn(r, 'display', k.slice(5)) === 'none';
		if (k === 'scope') return r && r.scope === 'global';
		if (k.indexOf('r:') === 0) return r ? pget(r, k.slice(2)) : undefined;
		if (k.indexOf('t:') === 0) return pget(S.global.theme || {}, k.slice(2));
		if (k.indexOf('site:') === 0) return (S.global.site || {})[k.slice(5)];
		if (k.indexOf('k:') === 0) { var ck = k.slice(2).split('.'), c = connById(ck[0]); return c ? c[ck[1]] : undefined; }
		return undefined;
	}

	function setK(k, v, noHist) {
		if (/^(t:|site:|k:)/.test(k)) {
			if (!noHist) pushHistory(k);
			if (k.indexOf('k:') === 0) {
				var ck = k.slice(2).split('.'), c = connById(ck[0]);
				if (c) { if (v === '' || v == null) delete c[ck[1]]; else c[ck[1]] = v; }
				if (S.global.connectors.indexOf(c) > -1) S.globalDirty = true;
				markDirty(); RT.setConnectors(allConns());
				return;
			}
			if (k.indexOf('t:') === 0) { S.global.theme = S.global.theme || {}; pset(S.global.theme, k.slice(2), v); }
			else { S.global.site = S.global.site || {}; if (v === '' || v == null || v === false) delete S.global.site[k.slice(5)]; else S.global.site[k.slice(5)] = v; RT.setSite(S.global.site); }
			S.globalDirty = true; markDirty(); updateCss();
			return;
		}
		if (!S.el && !S.sel) return;
		if (!noHist) pushHistory(k);
		var r;
		if (k.indexOf('c:') === 0) {
			r = ensureRuleFor(exactSel(), friendly(S.el));
			r.content = r.content || {};
			if (v === '' || v == null) delete r.content[k.slice(2)]; else r.content[k.slice(2)] = v;
			markDirty(r);
			fq(r.selector).forEach(function (el) { RT.applyRuleTo(el, r); });
			updateCss();
			return;
		}
		r = ruleE();
		if (k.indexOf('s:') === 0) sSet(r, k.slice(2), v);
		else if (k === 'tx' || k === 'ty') {
			var t = parseTranslate(sEff(r, 'translate'));
			t[k === 'tx' ? 0 : 1] = parseFloat(v) || 0;
			sSet(r, 'translate', (t[0] || t[1]) ? t[0] + 'px ' + t[1] + 'px' : '');
		} else if (k === 'cols') sSet(r, 'grid-template-columns', v ? 'repeat(' + parseInt(v, 10) + ',minmax(0,1fr))' : '');
		else if (k.indexOf('hide:') === 0) sSet(r, 'display', v ? 'none' : '', k.slice(5));
		else if (k.indexOf('r:') === 0) pset(r, k.slice(2), v);
		markDirty(r);
		updateCss();
		if (/^r:(anim|loop|fx|link|menu|popup|countdown|video|search)/.test(k)) fq(r.selector).forEach(function (el) { RT.applyRuleTo(el, r, { skipContent: true }); });
	}

	function syncValues() {
		$$('[data-k]', UI.body).forEach(function (inp) {
			var k = inp.dataset.k, v = getK(k);
			if (inp.classList.contains('ms-tiles')) {
				var list = inp.hasAttribute('data-multi') ? (v || []) : [v];
				$$('button', inp).forEach(function (b) { b.classList.toggle('on', list.indexOf(b.dataset.v) > -1 || (v != null && String(v) === b.dataset.v)); });
				return;
			}
			if (inp.type === 'checkbox') { inp.checked = JSON.stringify(v) === inp.dataset.on || (inp.dataset.on === 'true' && v === true); return; }
			if (inp === document.activeElement) return;
			var s = v == null ? '' : String(v);
			if (inp.hasAttribute('data-color')) { inp.value = /^#[0-9a-f]{6}$/i.test(s) ? s : (/^#[0-9a-f]{3}$/i.test(s) ? '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3] : '#000000'); return; }
			if (inp.dataset.unit != null && inp.dataset.unit !== '' && s) s = String(parseFloat(s));
			if (inp.type === 'range' && s === '') { inp.value = inp.min > 0 ? inp.min : 0; inp.classList.add('unset'); return; }
			inp.classList.remove('unset');
			inp.value = s;
		});
		var r = rule();
		$$('.ms-has-rule', UI.head).forEach(function (n) { n.style.display = r ? '' : 'none'; });
	}

	function readInput(inp) {
		var v = inp.value;
		if (inp.type === 'checkbox') return inp.checked ? JSON.parse(inp.dataset.on) : '';
		if (v === '') return '';
		if (inp.hasAttribute('data-num')) return parseFloat(v);
		if (inp.hasAttribute('data-len')) return len(v);
		if (inp.dataset.unit) return v + inp.dataset.unit;
		return v;
	}

	function bindPanel() {
		var body = document.querySelector('.ms-panel');
		body.addEventListener('input', function (e) {
			var inp = e.target; if (!inp.dataset.k || inp.type === 'checkbox' || inp.tagName === 'SELECT') return;
			if (inp.tagName === 'TEXTAREA' || inp.hasAttribute('data-lazy')) return; // applied on change
			setK(inp.dataset.k, readInput(inp));
			// keep paired controls (range + number, color + text) in sync
			$$('[data-k="' + inp.dataset.k + '"]', UI.body).forEach(function (o) {
				if (o === inp || o.classList.contains('ms-tiles')) return;
				if (o.hasAttribute('data-color')) { if (/^#[0-9a-f]{6}$/i.test(inp.value)) o.value = inp.value; }
				else if (!inp.hasAttribute('data-color') || o.type === 'text') o.value = inp.value;
				o.classList.remove('unset');
			});
		});
		body.addEventListener('change', function (e) {
			var inp = e.target;
			if (inp.hasAttribute('data-act-snap')) { S.snap = inp.checked; return; }
			if (inp.dataset.k === 'scope') { ACTIONS.scope(inp); return; }
			if (!inp.dataset.k) return;
			if (inp.tagName === 'SELECT' || inp.type === 'checkbox' || inp.tagName === 'TEXTAREA' || inp.hasAttribute('data-lazy')) {
				setK(inp.dataset.k, readInput(inp));
				if (inp.hasAttribute('data-rerender')) renderPanel(); else syncValues();
			}
		});
		body.addEventListener('click', function (e) {
			var tile = e.target.closest('.ms-tiles button');
			if (tile) {
				var box = tile.parentNode, k = box.dataset.k, v = tile.dataset.v;
				if (box.hasAttribute('data-multi')) {
					var list = (getK(k) || []).slice(), i = list.indexOf(v);
					if (i > -1) list.splice(i, 1); else list.push(v);
					setK(k, list.length ? list : '');
				} else {
					setK(k, String(getK(k)) === v ? '' : v);
				}
				if (box.hasAttribute('data-rerender') || /^r:(anim\.in|anim\.out|loop\.type|text\.preset|fx\.list)$/.test(k)) renderPanel(); else syncValues();
				return;
			}
			var sw = e.target.closest('[data-sw]');
			if (sw) { setK(sw.parentNode.dataset.swk, sw.dataset.sw); syncValues(); return; }
			var clr = e.target.closest('[data-clear]');
			if (clr) { setK(clr.dataset.clear, ''); syncValues(); return; }
			var b = e.target.closest('[data-act]');
			if (b && ACTIONS[b.dataset.act]) { ACTIONS[b.dataset.act](b); return; }
			var crumb = e.target.closest('[data-crumb]');
			if (crumb) { var p = S.el; for (var n = +crumb.dataset.crumb; n > 0 && p; n--) p = p.parentElement; if (p) select(p, true); }
			var rl = e.target.closest('[data-pick]');
			if (rl) {
				S.sel = rl.dataset.pick; S.el = fq(S.sel)[0] || null;
				if (S.el) S.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
				renderPanel();
			}
		});
	}

	/* ---------- render ---------- */
	function renderPanel() {
		if (!UI.body) return;
		var scroll = UI.body.scrollTop;
		$$('.ms-tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === S.tab); });
		var themeView = S.view === 'theme';
		UI.tabs.style.display = S.el && !themeView ? '' : 'none';
		UI.mode.style.display = S.el && !themeView ? '' : 'none';
		UI.panel.classList.toggle('ms-simple', !S.adv);
		$$('.ms-mode button').forEach(function (b) { b.classList.toggle('on', (b.dataset.act === 'mode-adv') === !!S.adv); });
		if (UI.hint) UI.hint.classList.toggle('hide', !!S.el || S.interact || !FD);
		var badges = tabBadges();
		$$('.ms-tabs button').forEach(function (b) { b.classList.toggle('has', !!badges[b.dataset.tab]); });
		updateQbar();
		$('[data-act=theme]').classList.toggle('on', themeView);
		UI.head.innerHTML = themeView ? '<div class="ms-h-title"><strong>🎨 Site theme & extras</strong><span class="ms-h-tools"><button data-act="theme" title="Close">' + icon('no-alt') + '</button></span></div><div class="ms-note" style="color:#9095a8">Applies to every page of the site.</div>' : renderHead();
		UI.body.innerHTML = themeView ? renderTheme() : S.el ? (TABS[S.tab] || TABS.edit)() : renderWelcome();
		syncValues();
		UI.body.scrollTop = scroll;
	}

	function renderHead() {
		if (!S.el) return '<div class="ms-h-empty">' + icon('admin-customizer') + ' Click any element on the page to edit it</div>';
		var el = S.el, count = fq(S.sel).length, exact = cssPath(el), sim = similarSel(el), simCount = fq(sim).length;
		var crumbs = [], p = el, i = 0;
		while (p && p !== FD.body && i < 6) { crumbs.unshift('<button data-crumb="' + i + '">' + esc(friendly(p)) + '</button>'); p = p.parentElement; i++; }
		var dev = S.state === 'hover' ? '<span class="ms-devtag">hover styles</span>' : S.device !== 'desktop' ? '<span class="ms-devtag">' + S.device + ' styles</span>' : '';
		return '<div class="ms-h-title"><strong>' + esc(friendly(el)) + '</strong> <code>&lt;' + el.tagName.toLowerCase() + '&gt;</code>' + dev +
			'<span class="ms-h-tools">' +
			'<button data-act="parent" title="Select parent (↑)">' + icon('arrow-up-alt') + '</button>' +
			'<button data-act="copy" title="Copy style (Ctrl+C)">' + icon('admin-page') + '</button>' +
			'<button data-act="paste" title="Paste style (Ctrl+V)"' + (S.clip ? '' : ' disabled') + '>' + icon('clipboard') + '</button>' +
			'<button data-act="reset" class="ms-has-rule" title="Reset this element">' + icon('image-rotate') + '</button>' +
			'<button data-act="deselect" title="Close (Esc)">' + icon('no-alt') + '</button></span></div>' +
			'<div class="ms-crumbs">' + crumbs.join('<i>›</i>') + '</div>' +
			'<div class="ms-target">' +
				'<button data-act="target-one" class="' + (S.sel === exact ? 'on' : '') + '">This element</button>' +
				'<button data-act="target-similar" class="' + (S.sel === sim && S.sel !== exact ? 'on' : '') + '" title="' + esc(sim) + '">All similar (' + simCount + ')</button>' +
				'<label class="ms-toggle" title="Show these edits on every page (header, menu, footer…)"><input type="checkbox" data-k="scope" data-on="true"' + (rule() && rule().scope === 'global' ? ' checked' : '') + '><span></span>All pages</label>' +
			'</div>' +
			'<div class="ms-state"><button data-act="state-normal" class="' + (S.state !== 'hover' ? 'on' : '') + '">Normal</button><button data-act="state-hover" class="' + (S.state === 'hover' ? 'on' : '') + '" title="Edit how it looks when the mouse is over it">Hover</button>' +
			(blockOf(el) ? '<span class="ms-blocktag">Added block</span>' : '') + '</div>' +
			(count > 1 ? '<div class="ms-note">Editing ' + count + ' elements at once</div>' : '');
	}

	function renderWelcome() {
		var rules = allRules(), blocks = (S.page.ops || []).filter(function (o) { return o.t === 'insert'; }).length;
		var card = function (act, ic, t, d) { return '<button type="button" class="ms-card-btn" data-act="' + act + '"><i>' + ic + '</i><b>' + t + '</b><small>' + d + '</small></button>'; };
		var list = rules.length ? rules.map(function (r) {
			var tags = [];
			if (r.content && Object.keys(r.content).length) tags.push('text');
			if (r.anim && (r.anim.in || r.anim.out)) tags.push('animation');
			if (r.fx && r.fx.list && r.fx.list.length) tags.push('effects');
			if (r.text && r.text.preset) tags.push('text style');
			if (r.frame) tags.push('frame');
			if (r.link && r.link.type) tags.push('link');
			if (r.style && ['desktop', 'tablet', 'mobile', 'hover'].some(function (d) { return r.style[d] && Object.keys(r.style[d]).length; })) tags.push('style');
			return '<button class="ms-rule" data-pick="' + esc(r.selector) + '"><b>' + esc(r.label || 'Element') + '</b>' +
				(r.scope === 'global' ? '<i class="g">all pages</i>' : '') + tags.map(function (t) { return '<i>' + t + '</i>'; }).join('') +
				'<small>' + esc(r.selector) + '</small></button>';
		}).join('') : '<p class="ms-hint">Nothing changed on this page yet – click anything on the page to begin.</p>';
		return '<div class="ms-home"><h3>What would you like to do?</h3><p>Click anything on your page to edit it, or start here:</p><div class="ms-cards">' +
			card('drawer', '＋', 'Add something', 'Elements, ready sections, frames &amp; images') +
			card('auto', '✨', 'Animate my page', 'One click – tasteful motion everywhere') +
			card('theme', '🎨', 'Pick a theme', 'Colors &amp; fonts for the whole site') +
			card('search', '🔎', 'Find a feature', 'Search every effect &amp; style (Ctrl+K)') +
			'</div><div class="ms-tipbox"><b>Tip:</b> double-click any text on the page to type over it. Drag images from your computer straight onto pictures to replace them.</div></div>' +
			sec('Changes on this page (' + rules.length + (blocks ? ' · ' + blocks + ' added blocks' : '') + ')', '<div class="ms-rules">' + list + '</div>', rules.length > 0);
	}
	function tabBadges() {
		var r = rule(); if (!r || !S.el) return {};
		function st(props) { return ['desktop', 'tablet', 'mobile', 'hover'].some(function (d) { return r.style && r.style[d] && props.some(function (p) { return r.style[d][p] != null; }); }); }
		var me = S.el;
		return {
			edit: !!((r.content && Object.keys(r.content).length) || r.frame || r.menu || r.header || r.icon || st(['color', 'background-color', 'background-image', 'border-radius', 'border-width', 'box-shadow', 'opacity', 'filter', 'display'])),
			animate: !!((r.anim && (r.anim.in || r.anim.out)) || (r.loop && r.loop.type)),
			fx: !!(r.fx && r.fx.list && r.fx.list.length),
			text: !!((r.text && r.text.preset) || st(['font-family', 'font-size', 'font-weight', 'letter-spacing', 'line-height', 'text-transform', 'text-align'])),
			layout: st(['translate', 'width', 'height', 'gap', 'grid-template-columns', 'flex-direction', 'margin-top', 'margin-bottom', 'padding-top', 'padding-bottom', 'position', 'rotate', 'scale']),
			link: !!(r.link && r.link.type) || allConns().some(function (c) { return fq(c.from)[0] === me || fq(c.to)[0] === me; })
		};
	}

	/* Floating toolbar next to the selected element (inside the page). */
	function updateQbar() {
		if (!UI.qbar) return;
		var el = S.el;
		if (!el) { UI.qbar.innerHTML = ''; return; }
		var b = function (q, ic, label, tip, main) { return '<button data-q="' + q + '" title="' + tip + '"' + (main ? ' class="ms-q-main"' : '') + '>' + icon(ic) + (label ? '<span>' + label + '</span>' : '') + '</button>'; };
		var h;
		if (el.tagName === 'IMG') h = b('replace', 'image', 'Replace', 'Replace image (or drop a file on it)', 1) + b('frame', 'frame', 'Frame', 'Crop into a shape');
		else if (isTextish(el) && el.children.length < 4 && el.textContent.trim().length) h = b('edit', 'pencil', 'Edit text', 'Type directly on the page', 1) + b('style', 'type', 'Style', 'Text style & font');
		else h = b('style', 'droplet', 'Style', 'Colors, background, borders', 1);
		h += b('animate', 'play', 'Animate', 'Entrance, exit & loop animations') + b('link', 'link', '', 'Link / action') + '<i></i>' +
			b('grab', 'grip', '', 'Drag to move it somewhere else') + b('up', 'up', '', 'Move up  (Alt+↑)') + b('down', 'down', '', 'Move down  (Alt+↓)') +
			b('dup', 'copy', '', 'Duplicate  (Ctrl+D)') + b('del', 'trash', '', blockOf(el) ? 'Delete  (Del)' : 'Hide on this device  (Del)');
		UI.qbar.innerHTML = h;
	}

	var TABS = {};

	TABS.edit = function () {
		var el = S.el, h = '';
		var content = '';
		if (el.tagName === 'IMG') {
			content += '<div class="ms-img-prev"><img src="' + esc(getK('c:src')) + '" alt=""></div>' +
				btn('media-src', icon('format-image') + ' Replace image', 'ms-primary ms-wide') +
				row('Image URL', cText('c:src', 'https://…', 'data-lazy')) + row('Alt text', cText('c:alt', 'Describe the image', 'data-lazy'));
		} else if (isTextish(el)) {
			content += btn('inline', icon('edit') + ' Edit text on the page', 'ms-primary ms-wide') + hint('Tip: double-click any text on the page to edit it directly.');
			if (el.innerHTML.length < 6000) content += row('Text / HTML', '<textarea data-k="c:html" rows="4"></textarea>', 'ms-col');
		}
		if (el.tagName === 'A') {
			content += row('Link URL', cText('c:href', 'https://…', 'data-lazy')) + row('', cToggle('c:target', 'Open in new tab', '_blank'));
		}
		if (content) h += sec('Content', content);

		h += sec('Colors & background',
			row('Text color', cColor('s:color')) +
			row('Background', cColor('s:background-color')) +
			'<div class="ms-sub">Gradient</div>' + cTiles('s:background-image', GRADIENTS.map(function (g) { return [g[1], '', g[0], 'background-image:' + g[1]]; }), { cls: 'ms-swatches' }) +
			'<div class="ms-btnrow">' + btn('media-bg', icon('format-image') + ' Background image') + btn('clear-bg', 'Remove') + '</div>' +
			row('Size', cSelect('s:background-size', [['cover', 'Cover'], ['contain', 'Contain'], ['auto', 'Original']])) +
			row('Position', cSelect('s:background-position', [['center', 'Center'], ['top', 'Top'], ['bottom', 'Bottom'], ['left', 'Left'], ['right', 'Right']])) +
			row('', cToggle('s:background-attachment', 'Fixed (parallax background)', 'fixed')));

		h += sec('Border, shadow & effects',
			row('Corner radius', cRange('s:border-radius', 0, 100, 1, 'px')) +
			row('Border width', cRange('s:border-width', 0, 20, 1, 'px')) +
			row('Border style', cSelect('s:border-style', ['solid', 'dashed', 'dotted', 'double', 'none'])) +
			row('Border color', cColor('s:border-color')) +
			'<div class="ms-sub">Shadow</div>' + cTiles('s:box-shadow', SHADOWS.map(function (s) { return [s[1], s[0]]; }), { cls: 'ms-chips' }) +
			row('Opacity', cRange('s:opacity', 0, 1, 0.05, '')) +
			'<div class="ms-sub">Filter</div>' + cTiles('s:filter', FILTERS.map(function (f) { return [f[1], f[0]]; }), { cls: 'ms-chips' }) +
			row('Blend mode', cSelect('s:mix-blend-mode', ['multiply', 'screen', 'overlay', 'darken', 'lighten', 'difference', 'luminosity'])) +
			row('Cursor', cSelect('s:cursor', ['pointer', 'default', 'grab', 'crosshair', 'zoom-in', 'not-allowed'])), false);

		h = editExtras(el) + h;
		h += sec('Visibility', row('', cToggle('hide:' + S.device, 'Hide on ' + S.device, true)) + hint('Hidden elements still exist; use the “Edits on this page” list or Undo to bring them back.'), false);
		return h;
	};

	TABS.animate = function () {
		var r = rule() || {}, a = r.anim || {}, l = r.loop || {};
		var h = sec('⚡ One-click recipes', '<div class="ms-recipes">' + RECIPES.map(function (x, i) {
			return '<button type="button" data-act="recipe" data-i="' + i + '" title="' + esc(x.d) + '"><span>' + x.i + '</span>' + esc(x.n) + '</button>';
		}).join('') + '</div>', !a.in && !a.out && !l.type);

		var inBody = cTiles('r:anim.in', IN_LIST, { cls: 'ms-anim-tiles' });
		if (a.in) {
			inBody += row('Trigger', cSelect('r:anim.trigger', [['load', 'On page load'], ['hover', 'On hover (replay)'], ['click', 'On click (replay)']], 'When scrolled into view', 'data-rerender')) +
				row('Duration', cRange('r:anim.duration', 100, 3000, 50, '', 'data-num')) +
				row('Delay', cRange('r:anim.delay', 0, 3000, 50, '', 'data-num')) +
				row('Easing', cSelect('r:anim.easing', [['ease-out', 'Ease out'], ['ease-in', 'Ease in'], ['ease-in-out', 'Ease in-out'], ['back', 'Back (overshoot)'], ['snappy', 'Snappy'], ['expo', 'Expo'], ['linear', 'Linear']], 'Smooth')) +
				row('Distance', cRange('r:anim.distance', 0, 300, 5, '', 'data-num')) +
				row(a.in === 'typewriter' ? 'Typing speed' : 'Stagger children', cRange('r:anim.stagger', 0, 500, 5, '', 'data-num')) +
				(isTextish(S.el) && a.in !== 'typewriter' ? row('Split text', cSelect('r:anim.split', [['letters', 'Letter by letter'], ['words', 'Word by word']], 'No split')) : '') +
				(!a.trigger || a.trigger === 'scroll' ? row('Start when', cRange('r:anim.offset', 0, 0.9, 0.05, '', 'data-num')) + row('', cToggle('r:anim.once', 'Replay every time it scrolls into view', false)) : '') +
				'<div class="ms-btnrow">' + btn('play-in', '▶ Play entrance', 'ms-primary') + '</div>' +
				hint('Durations in ms. “Stagger children” animates child items one after another – perfect for menus, cards and lists.');
		}
		h += sec('Entrance animation (in)', inBody);

		var outBody = cTiles('r:anim.out', OUT_LIST, { cls: 'ms-anim-tiles' });
		if (a.out) {
			outBody += row('Trigger', cSelect('r:anim.outTrigger', [['leave', 'When scrolled out of view'], ['delay', 'After a delay'], ['click', 'On click (toggle)']], 'Choose…', 'data-rerender')) +
				(a.outTrigger === 'delay' ? row('After (ms)', cRange('r:anim.outDelay', 500, 15000, 250, '', 'data-num')) : '') +
				row('Duration', cRange('r:anim.outDuration', 100, 3000, 50, '', 'data-num')) +
				'<div class="ms-btnrow">' + btn('play-out', '▶ Play exit', 'ms-primary') + '</div>';
			if (!a.outTrigger) outBody += hint('⚠ Choose a trigger so the exit animation knows when to run.');
		}
		h += sec('Exit animation (out)', outBody, !!a.out);

		var loopBody = cTiles('r:loop.type', LOOP_LIST, { cls: 'ms-anim-tiles' });
		if (l.type) {
			loopBody += row('Play', cSelect('r:loop.trigger', [['hover', 'Once on hover'], ['click', 'Once on click']], 'Forever (loop)')) +
				row('Duration', cRange('r:loop.duration', 200, 8000, 100, '', 'data-num')) +
				row('Delay', cRange('r:loop.delay', 0, 5000, 100, '', 'data-num')) +
				'<div class="ms-btnrow">' + btn('play-loop', '▶ Play', 'ms-primary') + '</div>';
		}
		h += sec('Loop / attention', loopBody, !!l.type);
		return h;
	};

	TABS.fx = function () {
		var r = rule() || {}, fx = r.fx || {}, list = fx.list || [];
		var h = '';
		if (list.length) {
			h += sec('Active FX settings',
				'<div class="ms-active">' + list.map(function (t) { return '<span>' + title(t) + '</span>'; }).join('') + '</div>' +
				row('Speed', cRange('r:fx.speed', 0.2, 3, 0.1, '', 'data-num')) +
				row('Intensity', cRange('r:fx.intensity', 0.2, 3, 0.1, '', 'data-num')) +
				row('Glow color', cColor('r:fx.color')) +
				list.filter(function (t) { return FX_HELP[t]; }).map(function (t) { return hint('<b>' + title(t) + ':</b> ' + FX_HELP[t]); }).join('') +
				'<div class="ms-btnrow">' + btn('clear-fx', 'Remove all FX') + '</div>');
		}
		FX_GROUPS.forEach(function (g, i) {
			h += sec(g[0], cTiles('r:fx.list', g[1].map(function (t) { return [t, title(t), FX_HELP[t] || title(t)]; }), { multi: true, cls: 'ms-fx-tiles' }), i < 3 || g[1].some(function (t) { return list.indexOf(t) > -1; }));
		});
		return h + hint('You can combine several FX. Hover-FX react when visitors hover the element.');
	};

	TABS.text = function () {
		var fontOpts = [["system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", 'System UI'], ['Georgia, serif', 'Georgia'], ["'Courier New', monospace", 'Courier']]
			.concat(FONTS.map(function (f) { return [fontValue(f[0]), f[0] + ' (' + f[2] + ')']; }));
		var h = sec('Text styles (' + Object.keys(TEXT_PRESETS).length + ')', cTiles('r:text.preset', Object.keys(TEXT_PRESETS).map(function (k) {
			var p = TEXT_PRESETS[k];
			return [k, '<b style="' + esc(styleStr(p.css)) + '">Aa</b><small>' + esc(p.n) + '</small>', p.n, p.dark ? 'background:#111' : ''];
		}), { cls: 'ms-ts-tiles' }) + hint('Text styles apply on all devices. Combine with the controls below.'));
		h += sec('Typography',
			row('Font', cSelect('s:font-family', fontOpts, 'Theme default')) +
			row('Size', cRange('s:font-size', 8, 160, 1, 'px')) +
			row('Weight', cSelect('s:font-weight', [['300', 'Light 300'], ['400', 'Regular 400'], ['500', 'Medium 500'], ['600', 'Semibold 600'], ['700', 'Bold 700'], ['800', 'Extra bold 800'], ['900', 'Black 900']])) +
			row('Line height', cRange('s:line-height', 0.8, 3, 0.05, '')) +
			row('Letter spacing', cRange('s:letter-spacing', -5, 30, 0.5, 'px')) +
			row('Word spacing', cRange('s:word-spacing', -5, 40, 1, 'px')) +
			row('Align', cTiles('s:text-align', [['left', icon('editor-alignleft')], ['center', icon('editor-aligncenter')], ['right', icon('editor-alignright')], ['justify', icon('editor-justify')]], { cls: 'ms-seg' })) +
			row('Transform', cSelect('s:text-transform', [['uppercase', 'UPPERCASE'], ['lowercase', 'lowercase'], ['capitalize', 'Capitalize'], ['none', 'None']])) +
			row('Style', cTiles('s:font-style', [['italic', '<i>Italic</i>'], ['normal', 'Normal']], { cls: 'ms-seg' })) +
			row('Decoration', cSelect('s:text-decoration', [['underline', 'Underline'], ['line-through', 'Strike'], ['overline', 'Overline'], ['none', 'None']])) +
			row('Color', cColor('s:color')) +
			row('Max width', cText('s:max-width', 'e.g. 60ch or 600px', 'data-len')) +
			row('Text shadow', cText('s:text-shadow', 'e.g. 0 2px 8px rgba(0,0,0,.3)')));
		return h;
	};

	TABS.layout = function () {
		var disp = sEff(rule(), 'display') || (S.el ? FW.getComputedStyle(S.el).display : '');
		var h = sec('Drag & resize',
			'<div class="ms-btnrow">' + btn('layout', (S.layout ? '✓ ' : '') + '✥ Drag / resize on page', S.layout ? 'ms-primary on' : 'ms-primary') + '</div>' +
			row('', '<label class="ms-toggle"><input type="checkbox" data-act-snap ' + (S.snap ? 'checked' : '') + '><span></span>Snap to 10px grid</label>') +
			row('Move X', cRange('tx', -600, 600, 1, 'px', 'data-unit=""')) +
			row('Move Y', cRange('ty', -600, 600, 1, 'px', 'data-unit=""')) +
			row('Width', cText('s:width', 'auto, 300px, 50%', 'data-len')) +
			row('Height', cText('s:height', 'auto, 400px, 100vh', 'data-len')) +
			row('Max width', cText('s:max-width', 'none, 1200px', 'data-len')) +
			row('Min height', cText('s:min-height', '0, 100vh', 'data-len')) +
			'<div class="ms-btnrow">' + btn('reset-pos', 'Reset position') + btn('reset-size', 'Reset size') + '</div>' +
			hint('Turn on drag/resize, then drag the pink “✥ drag” tab or the corner handles. Works per device.'));
		h += sec('Quick layouts', '<div class="ms-recipes ms-layouts">' + LAYOUTS.map(function (l, i) { return '<button type="button" data-act="quick-layout" data-i="' + i + '">' + esc(l[0]) + '</button>'; }).join('') + '</div>');
		var flex = /flex/.test(disp), grid = /grid/.test(disp);
		h += sec('Flex / grid',
			row('Display', cSelect('s:display', [['block', 'Block'], ['flex', 'Flex'], ['grid', 'Grid'], ['inline-block', 'Inline block'], ['inline-flex', 'Inline flex']], 'Default', 'data-rerender')) +
			(flex ? row('Direction', cTiles('s:flex-direction', [['row', '→ Row'], ['column', '↓ Column'], ['row-reverse', '← Rev'], ['column-reverse', '↑ Rev']], { cls: 'ms-seg' })) +
				row('Wrap', cToggle('s:flex-wrap', 'Wrap items', 'wrap')) : '') +
			(grid ? row('Columns', cRange('cols', 1, 12, 1, '', 'data-unit=""')) : '') +
			(flex || grid ? row('Justify', cSelect('s:justify-content', [['flex-start', 'Start'], ['center', 'Center'], ['flex-end', 'End'], ['space-between', 'Space between'], ['space-around', 'Space around'], ['space-evenly', 'Space evenly']])) +
				row('Align', cSelect('s:align-items', [['stretch', 'Stretch'], ['flex-start', 'Start'], ['center', 'Center'], ['flex-end', 'End'], ['baseline', 'Baseline']])) +
				row('Gap', cRange('s:gap', 0, 120, 1, 'px')) : '') +
			row('Order', cRange('s:order', -5, 10, 1, '')) + hint('“Order” reorders this item inside a flex/grid parent.'), flex || grid);
		var box = function (p) {
			return '<div class="ms-box"><span>' + p + '</span>' + ['top', 'right', 'bottom', 'left'].map(function (s) {
				return '<input type="text" class="ms-box-' + s + '" data-k="s:' + p + '-' + s + '" data-len placeholder="' + s.charAt(0).toUpperCase() + '" title="' + p + ' ' + s + '">';
			}).join('') + '</div>';
		};
		h += sec('Spacing', box('margin') + box('padding') + hint('Numbers become px. You can also type auto, 2rem, 5%…'));
		h += sec('Position & stacking',
			row('Position', cSelect('s:position', [['relative', 'Relative'], ['absolute', 'Absolute'], ['fixed', 'Fixed'], ['sticky', 'Sticky']], 'Default')) +
			row('Top', cText('s:top', 'auto', 'data-len')) + row('Left', cText('s:left', 'auto', 'data-len')) +
			row('Right', cText('s:right', 'auto', 'data-len')) + row('Bottom', cText('s:bottom', 'auto', 'data-len')) +
			row('Z-index', cRange('s:z-index', -1, 100, 1, '')) +
			row('Overflow', cSelect('s:overflow', ['visible', 'hidden', 'auto'])) +
			row('Rotate', cRange('s:rotate', -180, 180, 1, 'deg')) +
			row('Scale', cRange('s:scale', 0.2, 3, 0.05, '')), false);
		h += sec('Show / hide per device',
			['desktop', 'tablet', 'mobile'].map(function (d) { return row('', cToggle('hide:' + d, 'Hide on ' + d, true)); }).join(''), false);
		return h;
	};

	/* ==================================================================
	 * 5. ACTIONS, HISTORY, SAVE, AUTO-ANIMATE, MEDIA, KEYS
	 * ================================================================== */

	function snapshot() { return JSON.stringify({ p: S.page.rules, g: S.global.rules, po: S.page.ops, go: S.global.ops, pc: S.page.connectors, gc: S.global.connectors, t: S.global.theme, s: S.global.site }); }
	function pushHistory(key) {
		var now = Date.now();
		if (key && key === S.lastHistKey && now - S.lastHistTime < 800) { S.lastHistTime = now; return; }
		S.lastHistKey = key; S.lastHistTime = now;
		S.undo.push(snapshot());
		if (S.undo.length > 100) S.undo.shift();
		S.redo = [];
	}
	function restore(snap) {
		var o = JSON.parse(snap);
		var opsChanged = JSON.stringify([S.page.ops, S.global.ops]) !== JSON.stringify([o.po || [], o.go || []]);
		S.page.rules = o.p; S.global.rules = o.g;
		S.page.ops = o.po || []; S.global.ops = o.go || [];
		S.page.connectors = o.pc || []; S.global.connectors = o.gc || [];
		S.global.theme = o.t || {}; S.global.site = o.s || {};
		S.globalDirty = true;
		markDirty();
		if (opsChanged) { reloadFrame(); return; }
		reapplyAll();
		RT.setConnectors(allConns());
		RT.setSite(S.global.site);
		renderPanel();
	}
	function reapplyAll() {
		if (!FD) return;
		finishInlineEdit();
		RT.cleanupAll(FD.body);
		// restore original content everywhere, then re-apply all rules
		fq('*').forEach(function (el) { if (el.isConnected && (el._msOrigHTML != null || el._msOrigSrc || el._msOrigHref != null)) RT.applyContent(el, {}); });
		updateCss();
		RT.applyAll(allRules());
	}

	function pickMedia(cb) {
		if (!window.wp || !wp.media) { var u = prompt('Image URL'); if (u) cb({ url: u }); return; }
		var frame = wp.media({ title: 'Choose image', library: { type: 'image' }, multiple: false, button: { text: 'Use this image' } });
		frame.on('select', function () { cb(frame.state().get('selection').first().toJSON()); });
		frame.open();
	}
	function setContent(f, v) { setK('c:' + f, v); }

	function save() {
		finishInlineEdit();
		function pack(d, isGlobal) {
			var rules = d.rules.filter(function (r) { return !isEmptyRule(r); });
			var out = { rules: rules, ops: d.ops || [], connectors: d.connectors || [], css: genCss(rules), fonts: collectFonts(rules) };
			if (isGlobal) {
				out.theme = d.theme || {}; out.site = d.site || {};
				out.css = themeCss(out.theme, out.site) + out.css;
				out.fonts = out.fonts.concat(themeFonts(out.theme)).filter(function (f, i, a) { return a.indexOf(f) === i; });
			}
			return out;
		}
		UI.save.classList.add('busy');
		return fetch(CFG.rest + 'save', {
			method: 'POST', credentials: 'same-origin',
			headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': CFG.nonce },
			body: JSON.stringify({ key: S.key, url: S.url, title: S.title, page: pack(S.page), global: pack(S.global, true), saveGlobal: S.globalDirty })
		}).then(function (res) {
			return res.json().then(function (j) { if (!res.ok) throw new Error(j && j.message || res.statusText); return j; });
		}).then(function () {
			S.dirty = false; S.globalDirty = false;
			UI.save.classList.remove('dirty');
			clearDraft();
			toast('Saved – your changes are live', 'ok');
		}).catch(function (e) {
			toast('Save failed: ' + e.message, 'err');
			throw e;
		}).finally(function () { UI.save.classList.remove('busy'); });
	}

	function applyRecipe(i) {
		var x = RECIPES[i]; if (!x || !S.el) return;
		pushHistory('recipe');
		var target = S.el;
		if (x.menu) {
			var list = S.el.matches('ul,ol') ? S.el : (S.el.querySelector('ul,ol,.wp-block-navigation__container') || S.el.closest('ul,ol'));
			if (list) { target = list; select(list, true); }
		}
		var r = ruleE();
		['anim', 'loop', 'fx'].forEach(function (k) { if (x.r[k]) r[k] = clone(x.r[k]); else if (k !== 'fx') delete r[k]; });
		markDirty(r);
		updateCss();
		fq(r.selector).forEach(function (el) { RT.applyRuleTo(el, r, { skipContent: true }); });
		if (r.anim && r.anim.trigger && r.anim.trigger !== 'scroll') fq(r.selector).forEach(function (el) { RT.playIn(el, r.anim); });
		renderPanel();
		toast(x.i + ' ' + x.n + ' applied' + (target !== S.el ? ' to the menu list' : ''));
	}

	function autoAnimate() {
		if (!FD) return;
		pushHistory('auto');
		var plan = [
			['header nav ul, .wp-block-navigation__container, header .menu, nav ul', { in: 'fade-down', trigger: 'load', stagger: 80, duration: 600 }, 2],
			['footer, .site-footer', { in: 'fade-up', distance: 60, duration: 900 }, 2],
			['.wp-block-columns, .wp-block-gallery, .wp-block-post-template, ul.products, .elementor-container', { in: 'fade-up', stagger: 120, duration: 700 }, 20],
			['.wp-block-buttons, .wp-block-button, a.button, .btn, .elementor-button', { in: 'pop', duration: 600, easing: 'back' }, 20],
			['h1', { in: 'fade-up', trigger: 'load', delay: 150, duration: 900, easing: 'expo' }, 3],
			['h2, h3', { in: 'fade-up', duration: 800 }, 40],
			['img', { in: 'zoom-in', duration: 900 }, 40],
			['p, blockquote', { in: 'fade', duration: 700 }, 40]
		];
		var done = [], n = 0, skipped = 0;
		function covered(el) { return done.some(function (d) { return d === el || d.contains(el) || el.contains(d); }); }
		plan.forEach(function (p) {
			var count = 0;
			fq(p[0]).forEach(function (el) {
				if (count >= p[2] || isOurs(el) || covered(el)) return;
				var rc = el.getBoundingClientRect();
				if (rc.width < 10 || rc.height < 10) return;
				if (el.tagName === 'P' && el.textContent.trim().length < 25) return;
				var sel = cssPath(el), r = findRule(sel);
				if (r && r.anim && r.anim.in) { done.push(el); skipped++; return; }
				r = ensureRuleFor(sel, friendly(el));
				r.anim = clone(p[1]);
				done.push(el); count++; n++;
			});
		});
		markDirty();
		reapplyAll();
		renderPanel();
		toast('✨ Animated ' + n + ' elements' + (skipped ? ' (' + skipped + ' already moved)' : ''), 'ok', UNDO);
	}

	function applyLayout(i) {
		var l = LAYOUTS[i]; if (!l) return;
		pushHistory('layout');
		var r = ruleE();
		if (l[1] === 'reset') {
			LAYOUT_PROPS.forEach(function (p) { sSet(r, p, ''); });
		} else if (l[2] === 'mobile') {
			sSet(r, 'flex-direction', 'column', 'mobile');
			sSet(r, 'grid-template-columns', '1fr', 'mobile');
			sSet(r, 'flex-wrap', 'wrap', 'mobile');
			toast('Children will stack vertically on phones');
		} else {
			Object.keys(l[1]).forEach(function (p) { sSet(r, p, l[1][p]); });
		}
		markDirty(r); updateCss(); renderPanel();
	}

	var ACTIONS = {
		undo: function () { if (!S.undo.length) return toast('Nothing to undo'); S.redo.push(snapshot()); restore(S.undo.pop()); },
		redo: function () { if (!S.redo.length) return toast('Nothing to redo'); S.undo.push(snapshot()); restore(S.redo.pop()); },
		replay: function () { reapplyAll(); toast('Replaying animations'); },
		interact: function (b) {
			S.interact = !S.interact;
			(b || $('[data-act=interact]')).classList.toggle('on', S.interact);
			FD && FD.documentElement.classList.toggle('ms-editing', !S.interact);
			if (S.interact) { finishInlineEdit(); S.hov = null; }
			toast(S.interact ? 'Preview mode: the page works normally. Click the eye again to edit.' : 'Edit mode');
		},
		auto: function () {
			ask({ title: '✨ Auto-animate this page?', text: 'Adds tasteful entrance animations to the menu, headings, images, buttons, columns, paragraphs and footer. Elements that already move are left alone, and you can undo it.', ok: 'Animate my page' })
				.then(function (r) { if (r === 1) autoAnimate(); });
		},
		save: function () { save().catch(function () {}); },
		exit: function () {
			if (!S.dirty) { location.href = CFG.exitUrl; return; }
			ask({ title: 'Leave the editor?', text: 'You have unsaved changes.', ok: 'Save & exit', alt: 'Exit without saving', cancel: 'Keep editing' }).then(function (r) {
				if (r === 1) save().then(function () { S.dirty = false; location.href = CFG.exitUrl; });
				else if (r === 2) { S.dirty = false; clearDraft(); location.href = CFG.exitUrl; }
			});
		},
		dashboard: function () { location.href = CFG.adminUrl; },
		deselect: deselect,
		parent: function () { if (S.el && S.el.parentElement && S.el.parentElement !== FD.body) select(S.el.parentElement, true); },
		copy: function () {
			var r = rule(); if (!r) return toast('Nothing to copy yet');
			S.clip = clone({ style: r.style, text: r.text, anim: r.anim, loop: r.loop, fx: r.fx });
			renderPanel(); toast('Style copied – select another element and paste');
		},
		paste: function () {
			if (!S.clip || !S.el) return;
			pushHistory('paste');
			var r = ruleE();
			Object.keys(S.clip).forEach(function (k) { if (S.clip[k]) r[k] = clone(S.clip[k]); });
			markDirty(r); updateCss();
			fq(r.selector).forEach(function (el) { RT.applyRuleTo(el, r, { skipContent: true }); });
			renderPanel(); toast('Style pasted');
		},
		reset: function () {
			var r = rule(); if (!r) return;
			ask({ title: 'Reset this element?', text: 'Removes all Motion Studio styles, animations and effects from it.', ok: 'Reset', danger: true }).then(function (ok) {
				if (ok !== 1) return;
			pushHistory('reset');
			S.page.rules = S.page.rules.filter(function (x) { return x !== r; });
			S.global.rules = S.global.rules.filter(function (x) { if (x === r) S.globalDirty = true; return x !== r; });
			markDirty(); reapplyAll(); renderPanel();
			toast('Element reset', '', UNDO);
			});
		},
		scope: function (inp) {
			pushHistory('scope');
			var toGlobal = inp.checked, op = blockOf(S.el);
			if (op && S.el.parentElement && S.el.parentElement.id === op.id) {
				moveBlockScope(op, toGlobal);
				toast(toGlobal ? 'This added block (and its styles) now appears on every page where its position exists' : 'Block now on this page only');
				renderPanel();
				return;
			}
			var r = ruleE();
			S.page.rules = S.page.rules.filter(function (x) { return x !== r; });
			S.global.rules = S.global.rules.filter(function (x) { return x !== r; });
			r.scope = toGlobal ? 'global' : 'page';
			(toGlobal ? S.global.rules : S.page.rules).push(r);
			S.globalDirty = true; markDirty(r); updateCss();
			toast(toGlobal ? 'These edits will show on every page (great for header, menu & footer)' : 'Edits now apply to this page only');
		},
		'target-one': function () { if (S.el) { S.sel = cssPath(S.el); renderPanel(); } },
		'target-similar': function () {
			if (!S.el) return;
			var sim = similarSel(S.el), cur = rule();
			function go(copy) {
				if (copy) {
					pushHistory('similar');
					var nr = ensureRuleFor(sim, friendly(S.el) + ' (all)');
					['style', 'text', 'anim', 'loop', 'fx', 'frame', 'link'].forEach(function (k) { if (cur[k]) nr[k] = clone(cur[k]); });
					markDirty(nr); updateCss(); fq(sim).forEach(function (el) { RT.applyRuleTo(el, nr, { skipContent: true }); });
				}
				S.sel = sim; renderPanel(); forceHover();
				toast('Now editing all ' + fq(sim).length + ' similar elements together');
			}
			if (cur && cur.selector !== sim && !findRule(sim) && !isEmptyRule(cur)) {
				ask({ title: 'Copy this style to all similar?', text: 'Apply this element’s current styles & animations to all ' + fq(sim).length + ' similar elements too?', ok: 'Yes, copy it', alt: 'No, start fresh' }).then(function (r) { if (r) go(r === 1); });
			} else go(false);
		},
		inline: function () { if (S.el) startInlineEdit(S.el); },
		'media-src': function () { pickMedia(function (m) { setContent('src', m.url); if (m.alt) setContent('alt', m.alt); renderPanel(); }); },
		'media-bg': function () {
			pickMedia(function (m) {
				var r = ruleE(); pushHistory('bg');
				sSet(r, 'background-image', 'url("' + m.url.replace(/"/g, '') + '")');
				if (!sEff(r, 'background-size')) sSet(r, 'background-size', 'cover');
				if (!sEff(r, 'background-position')) sSet(r, 'background-position', 'center');
				markDirty(r); updateCss(); syncValues();
			});
		},
		'clear-bg': function () { setK('s:background-image', ''); syncValues(); },
		'clear-fx': function () { setK('r:fx', ''); renderPanel(); },
		recipe: function (b) { applyRecipe(+b.dataset.i); },
		'quick-layout': function (b) { applyLayout(+b.dataset.i); },
		'play-in': function () { var r = rule(); if (r && r.anim) fq(r.selector).forEach(function (el) { RT.playIn(el, r.anim); }); },
		'play-out': function () {
			var r = rule(); if (!r || !r.anim || !r.anim.out) return;
			fq(r.selector).forEach(function (el) { RT.playOut(el, r.anim, function () { setTimeout(function () { RT.applyRuleTo(el, r, { skipContent: true }); if (r.anim.in) RT.playIn(el, r.anim); else el.style.opacity = '1'; }, 500); }); });
		},
		'play-loop': function () { var r = rule(); if (r && r.loop) fq(r.selector).forEach(function (el) { RT.playLoop(el, r.loop, true); }); },
		layout: function () {
			S.layout = !S.layout;
			if (UI.ov) UI.ov.classList.toggle('ms-layout', S.layout);
			if (S.tab === 'layout') renderPanel();
			toast(S.layout ? 'Drag/resize ON – drag the pink tab or handles' : 'Drag/resize OFF');
		},
		'reset-pos': function () { setK('s:translate', ''); syncValues(); },
		'reset-size': function () { pushHistory('size'); var r = ruleE(); ['width', 'height', 'max-width', 'box-sizing'].forEach(function (p) { sSet(r, p, ''); }); markDirty(r); updateCss(); syncValues(); }
	};

	function onKey(e) {
		var t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
		var mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
		if (mod && k === 's') { e.preventDefault(); ACTIONS.save(); return; }
		if (mod && k === 'k') { e.preventDefault(); showSearch(); return; }
		if (document.querySelector('.ms-modal-bg')) return;
		if (e.key === 'Escape') { if (S.connecting || S.picking) { cancelPick(); return; } if (S.editing) { S.editing.blur(); finishInlineEdit(); } else deselect(); return; }
		if (typing) return;
		if (mod && k === 'z' && !e.shiftKey) { e.preventDefault(); ACTIONS.undo(); }
		else if (mod && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); ACTIONS.redo(); }
		else if (mod && k === 'c' && S.el) { e.preventDefault(); ACTIONS.copy(); }
		else if (mod && k === 'v' && S.el) { e.preventDefault(); ACTIONS.paste(); }
		else if (e.altKey && e.key === 'ArrowUp' && S.el) { e.preventDefault(); quickAction('up'); }
		else if (e.key === 'ArrowUp' && S.el && !mod) { e.preventDefault(); ACTIONS.parent(); }
		else if ((e.key === 'Delete' || e.key === 'Backspace') && S.el) { e.preventDefault(); quickAction('del'); }
		else if (mod && k === 'd' && S.el) { e.preventDefault(); quickAction('dup'); }
		else if (e.altKey && e.key === 'ArrowDown' && S.el) { e.preventDefault(); quickAction('down'); }
		else if (k === 'a' && !mod) ACTIONS.drawer();
		else if (e.key === '?') showShortcuts();
		else if (k === 'l' && !mod) ACTIONS.layout();
		else if (k === 'p' && !mod) ACTIONS.interact();
	}

	/* ==================================================================
	 * 6. DRAG & DROP BUILDER, BLOCKS, FRAMES, MEDIA, LINKS, THEMES
	 * ================================================================== */

	function rid() { return Math.random().toString(36).slice(2, 9); }
	function allOps() { return (S.global.ops || []).concat(S.page.ops || []); }
	function allConns() { return (S.global.connectors || []).concat(S.page.connectors || []); }
	function connById(id) { return allConns().filter(function (c) { return c.id === id; })[0] || null; }
	function opById(id) { return allOps().filter(function (o) { return o.id === id; })[0] || null; }
	function restUrl(path, query) {
		var base = CFG.restRoot || '/wp-json/';
		return base + path + (query ? (base.indexOf('?') > -1 ? '&' : '?') + query : '');
	}
	function blockOf(el) {
		var w = el && el.closest ? el.closest('ms-block') : null;
		while (w) {
			var op = opById(w.id);
			if (op && op.t === 'insert') return op;
			w = w.parentElement ? w.parentElement.closest('ms-block') : null;
		}
		return null;
	}
	function mainContainer() {
		return FD.querySelector('main .entry-content, .entry-content, main, #main, .site-main, .wp-site-blocks, #content, #page') || FD.body;
	}
	function reloadFrame() {
		S.reloadScroll = FW ? FW.scrollY : 0;
		UI.loading.style.display = '';
		FW.location.reload();
	}
	function friendlyBySel(sel) {
		var e = fq(sel)[0];
		if (!e) return sel;
		var t = (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 22);
		return friendly(e) + (t ? ' “' + t + '”' : '');
	}
	function moveBlockScope(op, toGlobal) {
		var from = toGlobal ? S.page : S.global, to = toGlobal ? S.global : S.page, pre = '#' + op.id;
		from.ops = from.ops.filter(function (o) { return o !== op; }); to.ops.push(op);
		from.rules.slice().forEach(function (r) {
			if (r.selector.indexOf(pre) === 0) { from.rules.splice(from.rules.indexOf(r), 1); r.scope = toGlobal ? 'global' : 'page'; to.rules.push(r); }
		});
		S.globalDirty = true; markDirty();
	}
	function rewriteSelectors(old, nw) {
		function rw(s) { return s === old ? nw : (s && s.indexOf(old + ' > ') === 0 ? nw + s.slice(old.length) : s); }
		S.page.rules.forEach(function (r) { r.selector = rw(r.selector); if (r.link && r.link.target) r.link.target = rw(r.link.target); });
		S.page.connectors.forEach(function (c) { c.from = rw(c.from); c.to = rw(c.to); });
		if (S.sel) S.sel = rw(S.sel);
	}

	/* ---------- inserting / moving / duplicating / deleting ---------- */
	function addBlock(html, spot, rules, label) {
		if (!FD || !spot || !spot.el) return null;
		pushHistory('add' + Date.now());
		var id = 'msb-' + rid();
		var op = { t: 'insert', id: id, html: html, anchor: spot.el === FD.body ? 'body' : cssPath(spot.el), pos: spot.pos === 'replace' ? 'after' : spot.pos, label: label || '' };
		var w = RT.applyOp(op);
		if (!w) { S.undo.pop(); toast('Could not add it there', 'err'); return null; }
		S.page.ops.push(op);
		(rules || []).forEach(function (spec) {
			var r = ensureRuleFor('#' + id + spec.s, label || '');
			Object.keys(spec).forEach(function (k) { if (k !== 's') r[k] = clone(spec[k]); });
		});
		markDirty(); updateCss();
		allRules().filter(function (r) { return r.selector.indexOf('#' + id) === 0; }).forEach(function (r) { RT.applyRule(r); });
		var root = w.firstElementChild;
		if (root) { select(root); root.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
		toast('Added ' + (label || 'element') + ' – double-click text to edit', 'ok');
		return w;
	}

	function moveEl(el, spot) {
		if (!spot || !spot.el || spot.el === el || el.contains(spot.el) || spot.pos === 'replace') return;
		pushHistory('move' + Date.now());
		var from = cssPath(el);
		var op = { t: 'move', id: 'msb-' + rid(), from: from, anchor: spot.el === FD.body ? 'body' : cssPath(spot.el), pos: spot.pos };
		var w = RT.applyOp(op);
		if (!w) { S.undo.pop(); toast('Can’t move it there', 'err'); return; }
		S.page.ops.push(op);
		var nw = cssPath(el);
		if (nw !== from) rewriteSelectors(from, nw);
		markDirty(); updateCss();
		RT.setConnectors(allConns());
		select(el, true);
		toast('Moved ✓', 'ok');
	}

	function visibleSib(n, dir) {
		var x = n;
		while ((x = dir < 0 ? x.previousElementSibling : x.nextElementSibling)) {
			if (x.hasAttribute('data-ms-ph') || isOurs(x) || /^(SCRIPT|STYLE|LINK|TEMPLATE)$/.test(x.tagName) || x.classList.contains('ms-burger')) continue;
			if (x.tagName === 'MS-BLOCK' && !x.firstElementChild) continue;
			return x;
		}
		return null;
	}

	function duplicate() {
		var el = S.el; if (!el || el === FD.body) return;
		var oldPath = cssPath(el);
		var related = allRules().filter(function (r) { try { return el.matches(r.selector) || el.querySelector(r.selector); } catch (e) { return false; } });
		RT.cleanupAll(el); RT.cleanup(el);
		var tpl = FD.createElement('template');
		tpl.innerHTML = el.outerHTML;
		var root = tpl.content.firstElementChild;
		[root].concat(Array.prototype.slice.call(root.querySelectorAll('*'))).forEach(function (n) {
			['id', 'contenteditable', 'data-ms-text', 'data-ms-mmenu', 'role', 'tabindex'].forEach(function (a) { n.removeAttribute(a); });
			Array.prototype.slice.call(n.classList).forEach(function (c) { if (/^ms-(fx|linked|caret|menu-open|open|force-hover)/.test(c)) n.classList.remove(c); });
			if (n.style) n.style.removeProperty('opacity');
		});
		Array.prototype.slice.call(root.querySelectorAll('.ms-burger, [data-ms-ph]')).forEach(function (b) { b.remove(); });
		var html = tpl.innerHTML;
		related.forEach(function (r) { RT.applyRule(r, { skipContent: true }); });
		RT.initWidgets(el);
		var w = addBlock(html, { el: el, pos: 'after' }, [], friendly(el) + ' copy');
		if (!w) return;
		var nr = w.firstElementChild, newPath = cssPath(nr);
		allRules().filter(function (r) { return r.selector === oldPath || r.selector.indexOf(oldPath + ' > ') === 0; }).forEach(function (r) {
			var c = clone(r); delete c.content; c.id = uid(); c.scope = 'page';
			c.selector = newPath + r.selector.slice(oldPath.length);
			S.page.rules.push(c);
		});
		updateCss();
		allRules().filter(function (r) { return r.selector.indexOf(newPath) === 0; }).forEach(function (r) { RT.applyRule(r, { skipContent: true }); });
		select(nr);
		toast('Duplicated ✓', 'ok');
	}

	function deleteEl() {
		var el = S.el; if (!el) return;
		var op = blockOf(el);
		if (op && el.parentElement && el.parentElement.id === op.id) {
			pushHistory('del' + Date.now());
			var pre = '#' + op.id;
			[S.page, S.global].forEach(function (d) {
				d.ops = d.ops.filter(function (o) { return o !== op; });
				d.rules = d.rules.filter(function (r) { return r.selector.indexOf(pre) !== 0; });
				d.connectors = d.connectors.filter(function (c) { return c.from.indexOf(pre) !== 0 && c.to.indexOf(pre) !== 0; });
			});
			el.parentElement.remove();
			S.globalDirty = true; markDirty(); updateCss(); RT.setConnectors(allConns());
			deselect();
			toast('Deleted', '', UNDO);
			return;
		}
		setK('hide:' + S.device, true); renderPanel();
		toast('Hidden on ' + S.device + ' (theme parts are hidden, not deleted)', '', UNDO);
	}

	function quickAction(q) {
		if (!S.el) return;
		var tabs = { style: S.el.tagName === 'IMG' ? 'edit' : (isTextish(S.el) && S.el.children.length < 3 ? 'text' : 'edit'), animate: 'animate', fx: 'fx', link: 'link', frame: 'edit', layout: 'layout' };
		if (tabs[q]) { S.tab = tabs[q]; S.view = 'element'; renderPanel(); if (q === 'frame') { var fs = $('.ms-frame-tiles', UI.body); if (fs) fs.scrollIntoView({ block: 'center' }); } return; }
		if (q === 'edit') return startInlineEdit(S.el);
		if (q === 'replace') return ACTIONS['media-src']();
		if (q === 'dup') return duplicate();
		if (q === 'del') return deleteEl();
		if (q === 'up' || q === 'down') {
			var ref = S.el;
			while (ref.parentElement && ref.parentElement.tagName === 'MS-BLOCK' && !visibleSib(ref, -1) && !visibleSib(ref, 1)) ref = ref.parentElement;
			var sib = visibleSib(ref, q === 'up' ? -1 : 1);
			if (!sib) return toast('Already at the ' + (q === 'up' ? 'top' : 'bottom') + ' of its container');
			moveEl(S.el, { el: sib, pos: q === 'up' ? 'before' : 'after' });
		}
	}

	/* ---------- drop target detection & indicator ---------- */
	var CONTAINER = /^(DIV|SECTION|MAIN|ARTICLE|ASIDE|HEADER|FOOTER|NAV|UL|OL|FORM|FIGURE)$/;
	function dropSpot(x, y, exclude, mode) {
		var list = FD.elementsFromPoint(x, y), t = null;
		for (var i = 0; i < list.length; i++) {
			var c = list[i];
			if (isOurs(c) || c === FD.documentElement || (c.hasAttribute && c.hasAttribute('data-ms-ph'))) continue;
			if (exclude && (c === exclude || exclude.contains(c))) continue;
			t = c; break;
		}
		if (!t) return null;
		if (mode === 'media' || mode === 'frame') {
			var im = t.tagName === 'IMG' ? t : (t.matches('figure, .ms-frame') ? t.querySelector('img') : null);
			if (im && im !== exclude) return { el: im, pos: 'replace' };
		}
		if (t === FD.body) return { el: mainContainer(), pos: 'append' };
		while (t.parentElement && t.parentElement !== FD.body && t.tagName !== 'IMG' && /^(inline|contents)$/.test(FW.getComputedStyle(t).display)) t = t.parentElement;
		if (t.tagName === 'MS-BLOCK') t = t.firstElementChild || t;
		if (exclude && (t === exclude || exclude.contains(t))) return null;
		var r = t.getBoundingClientRect(), ps = t.parentElement ? FW.getComputedStyle(t.parentElement) : null;
		var row = !!ps && ((/flex/.test(ps.display) && /row/.test(ps.flexDirection)) || (/grid/.test(ps.display) && ps.gridTemplateColumns.split(' ').length > 1));
		var rel = row ? (x - r.left) / r.width : (y - r.top) / r.height;
		var container = CONTAINER.test(t.tagName) && r.height > 40 && !t.matches('.ms-frame, .ms-btn-wrap, .ms-social, .ms-countdown');
		var pos = container && rel > 0.3 && rel < 0.7 ? 'append' : (rel < 0.5 ? 'before' : 'after');
		return { el: t, pos: pos, row: row };
	}
	function showDrop(sp) {
		hideDrop();
		if (!sp || !sp.el || !UI.dline) return;
		var r = sp.el.getBoundingClientRect();
		if (sp.pos === 'append' || sp.pos === 'replace') {
			var b = UI.dbox;
			b.style.display = 'block'; b.style.left = r.left + 'px'; b.style.top = r.top + 'px'; b.style.width = r.width + 'px'; b.style.height = r.height + 'px';
			b.firstChild.textContent = sp.pos === 'replace' ? 'Drop to replace / shape this image' : 'Inside ' + friendly(sp.el);
		} else {
			var l = UI.dline;
			l.style.display = 'block';
			if (sp.row) { l.style.width = '4px'; l.style.height = r.height + 'px'; l.style.top = r.top + 'px'; l.style.left = (sp.pos === 'before' ? r.left - 2 : r.right - 2) + 'px'; }
			else { l.style.height = '4px'; l.style.width = r.width + 'px'; l.style.left = r.left + 'px'; l.style.top = (sp.pos === 'before' ? r.top - 2 : r.bottom - 2) + 'px'; }
			l.firstChild.textContent = (sp.pos === 'before' ? 'Before ' : 'After ') + friendly(sp.el);
		}
	}
	function hideDrop() { if (UI.dline) { UI.dline.style.display = 'none'; UI.dbox.style.display = 'none'; } }

	/* ---------- reorder: drag the ⠿ handle under the selection ---------- */
	function startReorder() {
		var el = S.el, spot = null;
		S.drag = { reorder: true };
		UI.ghost.textContent = '⠿ ' + friendly(el);
		FD.documentElement.classList.add('ms-dragging-doc');
		function mv(ev) {
			UI.ghost.style.display = 'block';
			UI.ghost.style.left = ev.clientX + 'px'; UI.ghost.style.top = ev.clientY + 'px';
			spot = dropSpot(ev.clientX, ev.clientY, el, 'move');
			showDrop(spot);
			if (ev.clientY < 40) FW.scrollBy(0, -18); else if (ev.clientY > FW.innerHeight - 40) FW.scrollBy(0, 18);
		}
		function up() {
			FD.removeEventListener('mousemove', mv, true); FD.removeEventListener('mouseup', up, true);
			UI.ghost.style.display = 'none'; hideDrop(); FD.documentElement.classList.remove('ms-dragging-doc');
			S.drag = null;
			if (spot) moveEl(el, spot);
		}
		FD.addEventListener('mousemove', mv, true); FD.addEventListener('mouseup', up, true);
	}

	/* ---------- the + Add drawer ---------- */
	function bindDrawer() {
		UI.drawer.addEventListener('click', function (e) {
			var t = e.target.closest('[data-dtab]');
			if (t) { S.dtab = t.dataset.dtab; renderDrawer(); return; }
			var b = e.target.closest('[data-act]');
			if (b && ACTIONS[b.dataset.act]) ACTIONS[b.dataset.act](b);
		});
		UI.drawer.addEventListener('mousedown', libDown);
		UI.drawer.addEventListener('change', function (e) {
			if (!e.target.hasAttribute('data-upload')) return;
			var files = Array.prototype.slice.call(e.target.files || []);
			files.reduce(function (p, f) { return p.then(function () { return uploadFile(f); }); }, Promise.resolve())
				.then(function () { toast('Uploaded ✓ – drag images onto the page', 'ok'); renderDrawer(); })
				.catch(function (err) { toast(err.message, 'err'); });
		});
	}
	function renderDrawer() {
		var dsi = $('[data-dsearch]'); if (dsi) { dsi.value = ''; dsi.placeholder = 'Search ' + ({ elements: 'elements', sections: 'sections', frames: 'frames', media: 'images' }[S.dtab] || '') + '…'; }
		$$('.ms-dtabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.dtab === S.dtab); });
		var h = '';
		if (S.dtab === 'elements') {
			h = '<p class="ms-hint">Drag onto the page – or click to add after the selected element.</p><div class="ms-libgrid">' +
				ELEMENTS.map(function (e) { return '<div class="ms-lib" data-kind="el" data-id="' + e.id + '"><span>' + e.i + '</span>' + esc(e.n) + '</div>'; }).join('') + '</div>';
		} else if (S.dtab === 'sections') {
			h = '<p class="ms-hint">Ready-made, pre-animated sections. Drag between sections of your page.</p><div class="ms-libcol">' +
				SECTIONS.map(function (x) { return '<div class="ms-lib ms-lib-wide" data-kind="sec" data-id="' + x.id + '"><b>' + esc(x.n) + '</b><small>' + (x.rules && x.rules.length ? '✨ animated' : 'section') + '</small></div>'; }).join('') + '</div>';
		} else if (S.dtab === 'frames') {
			h = '<p class="ms-hint">Canva-style frames: <b>drag a frame onto any image</b> to crop it into that shape, or drop it on the page to add a new framed image.</p><div class="ms-libgrid ms-framegrid">' +
				Object.keys(FRAMES).map(function (k) { return '<div class="ms-lib" data-kind="frame" data-id="' + k + '"><img src="' + esc(PH) + '" alt="" style="' + esc(styleStr(FRAMES[k].css)) + '">' + esc(FRAMES[k].n) + '</div>'; }).join('') + '</div>';
		} else {
			h = (CFG.canUpload !== false ? '<label class="ms-btn ms-primary ms-wide">⬆ Upload images<input type="file" accept="image/*" multiple hidden data-upload></label>' : '') +
				btn('media-lib', '📚 Open media library', 'ms-wide') +
				'<p class="ms-hint">Drag an image onto a picture or frame to swap it, or anywhere to add it. You can also drop files from your computer straight onto the page.</p>';
			if (S.media == null) { h += '<p class="ms-hint">Loading…</p>'; loadMedia(); }
			else if (S.media === 'loading') h += '<p class="ms-hint">Loading…</p>';
			else if (!S.media.length) h += '<p class="ms-hint">No images in your library yet.</p>';
			else h += '<div class="ms-mediagrid">' + S.media.map(function (m) { return '<div class="ms-lib ms-media" data-kind="media" data-url="' + esc(m.url) + '" data-alt="' + esc(m.alt) + '"><img src="' + esc(m.thumb) + '" alt=""></div>'; }).join('') + '</div>';
		}
		UI.dbody.innerHTML = h;
	}
	function loadMedia() {
		S.media = 'loading';
		fetch(restUrl('wp/v2/media', 'media_type=image&per_page=48'), { credentials: 'same-origin', headers: { 'X-WP-Nonce': CFG.nonce } })
			.then(function (r) { return r.json(); })
			.then(function (list) {
				S.media = (Array.isArray(list) ? list : []).map(function (m) {
					var sz = (m.media_details && m.media_details.sizes) || {};
					return { url: m.source_url, thumb: ((sz.medium || sz.thumbnail || {}).source_url) || m.source_url, alt: m.alt_text || '' };
				});
			}).catch(function () { S.media = []; })
			.then(function () { if (S.dtab === 'media') renderDrawer(); });
	}
	function uploadFile(file) {
		if (!file || !/^image\//.test(file.type)) return Promise.reject(new Error('Please drop an image file'));
		toast('Uploading ' + file.name + '…');
		return fetch(restUrl('wp/v2/media'), {
			method: 'POST', credentials: 'same-origin', body: file,
			headers: { 'X-WP-Nonce': CFG.nonce, 'Content-Type': file.type, 'Content-Disposition': 'attachment; filename="' + file.name.replace(/[^\w.\-]/g, '_') + '"' }
		}).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.message || 'Upload failed'); return j; }); })
			.then(function (j) {
				var m = { url: j.source_url, thumb: j.source_url, alt: j.alt_text || '' };
				if (Array.isArray(S.media)) S.media.unshift(m);
				return m;
			});
	}
	function placeMedia(m, sp) {
		if (sp && sp.pos === 'replace') {
			select(sp.el);
			setContent('src', m.url);
			if (m.alt) setContent('alt', m.alt);
			renderPanel();
			toast('Image replaced ✓', 'ok');
		} else {
			addBlock('<img class="ms-img-el" src="' + esc(m.url) + '" alt="' + esc(m.alt || '') + '">', sp || { el: mainContainer(), pos: 'append' }, [], 'Image');
		}
	}
	function bindFileDrop() {
		function hasFiles(e) { return e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') > -1; }
		FD.addEventListener('dragover', function (e) {
			if (!hasFiles(e)) return;
			e.preventDefault();
			FD.documentElement.classList.add('ms-filedrag');
			S.fileSpot = dropSpot(e.clientX, e.clientY, null, 'media');
			showDrop(S.fileSpot);
		});
		FD.addEventListener('dragleave', function (e) { if (!e.relatedTarget) { FD.documentElement.classList.remove('ms-filedrag'); hideDrop(); } });
		FD.addEventListener('drop', function (e) {
			if (!hasFiles(e)) return;
			e.preventDefault();
			FD.documentElement.classList.remove('ms-filedrag'); hideDrop();
			var sp = S.fileSpot;
			uploadFile(e.dataTransfer.files[0]).then(function (m) { placeMedia(m, sp); }).catch(function (err) { toast(err.message, 'err'); });
		});
	}

	function libDown(e) {
		var t = e.target.closest('.ms-lib');
		if (!t || e.button !== 0 || !FD) return;
		e.preventDefault();
		var sx = e.clientX, sy = e.clientY, moved = false, ghost, spot = null;
		// Shield right away: fast drags would otherwise enter the iframe before we notice.
		var shield = document.createElement('div'); shield.className = 'ms-shield'; document.body.appendChild(shield);
		function mv(ev) {
			if (!moved) {
				if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 6) return;
				moved = true;
				ghost = document.createElement('div'); ghost.className = 'ms-pghost'; ghost.textContent = t.textContent.trim() || 'Image'; document.body.appendChild(ghost);
			}
			ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px';
			var fr = FR.getBoundingClientRect(), x = ev.clientX - fr.left, y = ev.clientY - fr.top;
			if (x >= 0 && y >= 0 && x <= fr.width && y <= fr.height) {
				spot = dropSpot(x, y, null, t.dataset.kind);
				showDrop(spot);
				if (y < 50) FW.scrollBy(0, -20); else if (y > fr.height - 50) FW.scrollBy(0, 20);
			} else { spot = null; hideDrop(); }
		}
		function up() {
			document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up);
			if (shield) shield.remove(); if (ghost) ghost.remove();
			hideDrop();
			if (!moved) libClick(t); else if (spot) libDrop(t, spot);
		}
		document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
	}
	function libClick(t) {
		var kind = t.dataset.kind, sp;
		if ((kind === 'frame' || kind === 'media') && S.el && S.el.tagName === 'IMG') sp = { el: S.el, pos: 'replace' };
		else if (S.el && S.el !== FD.body) sp = { el: S.el, pos: 'after' };
		else sp = { el: mainContainer(), pos: 'append' };
		libDrop(t, sp);
	}
	function libDrop(t, sp) {
		var kind = t.dataset.kind, id = t.dataset.id, def;
		if (kind === 'el') { def = ELEMENTS.filter(function (x) { return x.id === id; })[0]; if (def) addBlock(def.html(), sp.pos === 'replace' ? { el: sp.el, pos: 'after' } : sp, def.rules, def.n); }
		else if (kind === 'sec') { def = SECTIONS.filter(function (x) { return x.id === id; })[0]; if (def) addBlock(def.html(), sp.pos === 'replace' ? { el: sp.el, pos: 'after' } : sp, def.rules, def.n); }
		else if (kind === 'frame') {
			if (sp.pos === 'replace') { select(sp.el); setK('r:frame', id); renderPanel(); toast('Frame “' + FRAMES[id].n + '” applied ✓', 'ok'); }
			else addBlock('<figure class="ms-frame" style="max-width:360px">' + img('') + '</figure>', sp, [{ s: ' img', frame: id }], 'Frame: ' + FRAMES[id].n);
		} else if (kind === 'media') placeMedia({ url: t.dataset.url, alt: t.dataset.alt || '' }, sp);
	}

	/* ---------- connect / pick modes ---------- */
	function finishPick(t) {
		var sel = cssPath(t);
		if (S.connecting) {
			var from = S.connecting; cancelPick(true);
			if (sel === from) { toast('Pick a different element'); return; }
			pushHistory('conn' + Date.now());
			S.page.connectors.push({ id: 'c' + rid(), from: from, to: sel, type: 'curve', color: '#8b5cf6', width: 2, draw: true });
			markDirty(); RT.setConnectors(allConns());
			S.tab = 'link'; renderPanel();
			toast('Connected ✓ – style the line below', 'ok');
			return;
		}
		if (S.picking) { var k = S.picking; cancelPick(true); setK(k, sel); renderPanel(); toast('Target set: ' + friendlyBySel(sel), 'ok'); }
	}
	function cancelPick(silent) {
		S.connecting = null; S.picking = null;
		if (FD) FD.documentElement.classList.remove('ms-mode-pick');
		if (!silent) toast('Cancelled');
	}

	/* ---------- Edit tab: context sections (menu, header, frame, icon, video, popup…) ---------- */
	function editExtras(el) {
		var h = '';
		var isMenu = el.matches('nav, .menu, .wp-block-navigation, .wp-block-navigation__container, [role=navigation]') || (el.matches('ul, ol') && !!el.closest('nav, header, .menu, .site-header'));
		var isHeader = el.matches('header, .site-header, #masthead, header.wp-block-template-part');
		if (isMenu) {
			h += sec('☰ Menu style',
				cTiles('r:menu.style', Object.keys(MENU_STYLES).map(function (k) { return [k, MENU_STYLES[k].n]; }), { cls: 'ms-chips' }) +
				row('Accent', cColor('r:menu.accent')) + row('Link color', cColor('r:menu.color')) +
				row('Font size', cRange('r:menu.size', 10, 30, 1, '', 'data-num')) + row('Gap', cRange('r:menu.gap', 0, 80, 1, '', 'data-num')) +
				row('', cToggle('r:menu.upper', 'UPPERCASE links', true)) +
				'<div class="ms-sub">Phone menu</div>' +
				row('Style', cSelect('r:menu.mobile', [['drawer', 'Slide-in drawer'], ['fullscreen', 'Full screen overlay'], ['dropdown', 'Dropdown']], 'Theme default')) +
				row('Background', cColor('r:menu.mobileBg')) +
				hint('Motion Studio adds its own ☰ button on phones. If your theme shows one too, select it in mobile view and press Delete to hide it.'));
		}
		if (isHeader) {
			h += sec('Header behaviour',
				row('', cToggle('r:header.sticky', 'Sticky – stays on top', true)) + row('', cToggle('r:header.shrink', 'Shrink on scroll', true)) +
				row('', cToggle('r:header.blur', 'Frosted glass on scroll', true)) + row('Glass color', cColor('r:header.blurColor')) +
				row('', cToggle('r:header.transparent', 'Transparent until scrolled', true)) + row('', cToggle('r:header.hide', 'Hide on scroll down, show on scroll up', true)) +
				(el.querySelector('nav, ul') ? btn('select-menu', '☰ Select the menu inside', 'ms-wide') : ''));
		}
		if (el.tagName === 'IMG' || el.tagName === 'VIDEO' || el.matches('.ms-video, .ms-card, .ms-shape, .ms-cta')) {
			var src = el.tagName === 'IMG' ? (el.currentSrc || el.src) : PH;
			h += sec('◯ Frame / shape', cTiles('r:frame', Object.keys(FRAMES).map(function (k) {
				return [k, '<img src="' + esc(src) + '" alt="" style="' + esc(styleStr(FRAMES[k].css)) + '"><small>' + FRAMES[k].n + '</small>', FRAMES[k].n];
			}), { cls: 'ms-frame-tiles' }) + hint('The image is cropped into the shape (like Canva frames). Tip: drag frames from <b>+ Add → Frames</b> straight onto images.'));
		}
		if (el.matches('.ms-icon')) {
			h += sec('★ Icon', cTiles('r:icon', Object.keys(ICON_PATHS).map(function (k) {
				return [k, '<i class="ms-ico-prev" style="-webkit-mask-image:' + esc(iconUri(k)) + ';mask-image:' + esc(iconUri(k)) + '"></i>', k];
			}), { cls: 'ms-icon-tiles' }) + row('Size', cRange('s:font-size', 12, 200, 1, 'px')) + row('Color', cColor('s:color')));
		}
		if (el.matches('.ms-video')) h += sec('▶ Video', row('YouTube / Vimeo link', cText('r:video.url', 'https://youtube.com/watch?v=…', 'data-lazy'), 'ms-col'));
		if (el.matches('.ms-countdown')) h += sec('⏱ Countdown', row('Ends at', '<input type="datetime-local" data-k="r:countdown.date" data-lazy>') + hint('Uses the visitor’s local time.'));
		var inlineOnly = !el.querySelector('*:not(br):not(span):not(strong):not(em):not(b):not(i):not(u):not(mark):not(small)');
		if (inlineOnly && el.textContent.trim() && !/^(IMG|INPUT|SELECT|TEXTAREA|SVG)$/i.test(el.tagName) && !el.closest('.ms-search')) {
			h += sec('✨ AI writer (Gemini)', CFG.aiReady ?
				'<textarea data-ai="prompt" rows="3" placeholder="e.g. Friendly headline for a bakery, or: translate to Malayalam" style="width:100%;box-sizing:border-box"></textarea>' +
				row('Task', '<select data-ai="mode"><option value="rewrite">Rewrite this text</option><option value="write">Write new text</option><option value="shorter">Make shorter</option><option value="longer">Make longer</option><option value="fix">Fix spelling &amp; grammar</option><option value="translate">Translate (say which language above)</option></select>') +
				btn('ai-run', '✨ Generate and apply', 'ms-primary ms-wide') + hint('Replaces this element’s text. Use Undo (Ctrl+Z) if you don’t like it.') :
				hint('Add your Gemini API key in <b>Motion Studio → Settings</b> in the WordPress dashboard to turn this on.'));
		}
		var sBar = el.closest('.ms-search');
		if (sBar && sBar !== el) h += sec('🔎 Search bar', btn('select-search', 'Select the whole search bar', 'ms-wide'));
		if (el.matches('.ms-search')) {
			h += sec('🔎 Search bar',
				'<div class="ms-sub">Type</div>' +
				cTiles('r:search.type', SEARCH_TYPES, { cls: 'ms-chips' }) +
				row('Placeholder', cText('r:search.placeholder', 'Search…', 'data-lazy'), 'ms-col') +
				row('Button text', cText('r:search.button', 'Empty = magnifier icon', 'data-lazy'), 'ms-col') +
				row('Search in', cSelect('r:search.scope', [['all', 'Whole site'], ['post', 'Posts only'], ['page', 'Pages only'], ['product', 'Products (WooCommerce)']])) +
				row('', cToggle('r:search.live', 'Show live results while typing', true)) +
				row('Width', cRange('s:width', 160, 900, 5, 'px')) +
				hint('Visitors are taken to your theme’s normal search results page. Live results use the public WordPress search.'));
		}
		var lBar = el.closest('.ms-logo-el');
		if (lBar && lBar !== el) h += sec('◈ Logo', btn('select-logo', 'Select the whole logo', 'ms-wide'));
		if (el.matches('.ms-logo-el')) {
			h += sec('◈ Logo',
				btn('logo-pick', icon('format-image') + ' Choose logo image', 'ms-primary ms-wide') +
				(CFG.siteLogo ? btn('logo-site', 'Use my site logo', 'ms-wide') : '') +
				row('Show', cSelect('r:logo.mode', [['both', 'Logo + name'], ['image', 'Logo image only'], ['text', 'Name only']])) +
				row('Logo height', cRange('r:logo.size', 16, 200, 1, '', 'data-num')) +
				row('Corner round', cRange('r:logo.round', 0, 50, 1, '', 'data-num')) +
				row('Name size', cRange('r:logo.textSize', 12, 64, 1, '', 'data-num')) +
				row('Name color', cColor('r:logo.color')) +
				row('Gap', cRange('r:logo.gap', 0, 40, 1, '', 'data-num')) +
				hint('Double-click the name to rename it. It links to your home page – change that in the <b>Link</b> tab.'));
		}
		var mq = el.matches('.ms-marquee, .ms-marquee-track') ? el : el.closest('.ms-marquee');
		if (mq) {
			h += sec('🏷 Logos',
				btn('marquee-add', '+ Add logos from Media Library', 'ms-primary ms-wide') +
				btn('marquee-clear', 'Remove placeholder names', 'ms-wide') +
				hint('Pick several images at once. They scroll in the strip and turn colorful on hover.'));
		}
		if (isHeader && !el.querySelector('.ms-logo-el')) h += sec('Add to header', btn('logo-header', '◈ Add logo here', 'ms-wide') + (el.querySelector('.ms-search') ? '' : btn('search-header', '🔎 Add search bar here', 'ms-wide')));
		if (el.matches('.ms-popup')) {
			h += sec('🗔 Popup', row('Auto-open after (s)', cRange('r:popup.delay', 0, 60, 1, '', 'data-num')) + row('', cToggle('r:popup.once', 'Only once per visitor', true)) +
				hint('0 = opens only from a button. Select a button → <b>Link</b> tab → “Open / close popup” → pick this popup.'));
		} else if (el.closest('.ms-popup')) h += sec('🗔 Popup', btn('select-popup', 'Select the whole popup', 'ms-wide'));
		return h;
	}

	/* ---------- Link tab ---------- */
	TABS.link = function () {
		var r = rule() || {}, l = r.link || {}, t = l.type || '';
		var b = row('Action', cSelect('r:link.type', [['url', 'Open web address'], ['page', 'Go to a page on this site'], ['scroll', 'Scroll to an element'], ['toggle', 'Open / close a popup or element'], ['top', 'Back to top'], ['email', 'Send email'], ['phone', 'Call phone number'], ['whatsapp', 'WhatsApp chat']], 'None', 'data-rerender'));
		if (t === 'url') b += row('URL', cText('r:link.value', 'https://…', 'data-lazy')) + row('', cToggle('r:link.newTab', 'Open in new tab', true));
		if (t === 'page') b += row('Page', cSelect('r:link.value', (CFG.pages || []).map(function (p) { return [p[1], p[0]]; }), 'Choose a page…')) + row('', cToggle('r:link.newTab', 'Open in new tab', true));
		if (t === 'scroll' || t === 'toggle') {
			b += row('Target', '<div class="ms-pickrow"><code>' + esc(l.target ? friendlyBySel(l.target) : 'not set') + '</code>' + btn('pick', '🎯 Pick on page', '', 'data-key="r:link.target"') + '</div>');
			if (t === 'scroll') b += row('Offset', cRange('r:link.offset', 0, 300, 5, '', 'data-num')) + hint('Offset keeps the target below a sticky header.');
			if (t === 'toggle') {
				var pops = fq('.ms-popup');
				if (pops.length) b += '<div class="ms-btnrow">' + pops.map(function (p, i) { var hd = p.querySelector('h1,h2,h3'); return btn('set-target', '🗔 ' + esc(hd ? hd.textContent.trim().slice(0, 18) : 'Popup ' + (i + 1)), '', 'data-sel="' + esc(cssPath(p)) + '"'); }).join('') + '</div>';
				else b += hint('No popups yet – add one from <b>+ Add → Elements → Popup</b>.');
			}
		}
		if (t === 'email') b += row('Email', cText('r:link.value', 'hello@example.com', 'data-lazy'));
		if (t === 'phone') b += row('Phone', cText('r:link.value', '+91 98765 43210', 'data-lazy'));
		if (t === 'whatsapp') b += row('Number', cText('r:link.value', 'Country code + number', 'data-lazy')) + row('Message', cText('r:link.msg', 'Hi! I have a question', 'data-lazy'));
		var h = sec('🔗 Link / action', b + hint('Works on anything – images, cards, icons, sections – not just buttons.'));

		var me = S.el;
		var mine = allConns().filter(function (c) { return fq(c.from)[0] === me || fq(c.to)[0] === me; });
		var cb = btn('connect', '〰 Connect to another element…', 'ms-primary ms-wide') + mine.map(function (c) {
			var out = fq(c.from)[0] === me, k = 'k:' + c.id + '.';
			return '<div class="ms-conn"><div class="ms-conn-h"><b>' + (out ? '→ to ' : '← from ') + '</b>' + esc(friendlyBySel(out ? c.to : c.from)) + '<button type="button" class="ms-x" data-act="conn-del" data-id="' + esc(c.id) + '" title="Delete line">×</button></div>' +
				row('Line', cTiles(k + 'type', [['curve', 'Curve'], ['straight', 'Straight'], ['elbow', 'Elbow']], { cls: 'ms-seg' })) +
				row('Color', cColor(k + 'color')) + row('Width', cRange(k + 'width', 1, 12, 1, '', 'data-num')) +
				row('Style', cSelect(k + 'dash', [['dashed', 'Dashed'], ['dotted', 'Dotted']], 'Solid')) +
				row('Arrow', cSelect(k + 'arrow', [['start', '← Start'], ['both', '↔ Both'], ['none', 'No arrow']], '→ End')) +
				row('', cToggle(k + 'flow', 'Animated flow', true)) + row('', cToggle(k + 'draw', 'Draw in when visible', true)) + '</div>';
		}).join('');
		h += sec('〰 Connections', cb + hint('Draw lines/arrows between elements – perfect for steps, timelines and “how it works” diagrams. Lines follow the elements on every screen size.'));
		return h;
	};

	/* ---------- Theme panel ---------- */
	function renderTheme() {
		var t = S.global.theme || {};
		var tiles = '<div class="ms-themes"><button type="button" class="ms-theme' + (!t.id ? ' on' : '') + '" data-act="theme-none"><div class="ms-sw"><i style="background:#ccc"></i><i style="background:#999"></i></div><b>Theme default</b><small>No changes</small></button>' +
			Object.keys(THEMES).map(function (k) {
				var th = THEMES[k];
				return '<button type="button" class="ms-theme' + (t.id === k ? ' on' : '') + '" data-act="theme-pick" data-id="' + k + '" style="background:' + th.c.bg + ';color:' + th.c.text + '">' +
					'<div class="ms-sw">' + ['primary', 'accent', 'heading', 'text'].map(function (c) { return '<i style="background:' + th.c[c] + '"></i>'; }).join('') + '</div>' +
					'<b style="color:' + th.c.heading + ';font-family:' + esc(fontValue(th.f.h)) + '">' + th.n + '</b><small>' + th.f.h + ' · ' + th.f.b + '</small></button>';
			}).join('') + '</div>';
		var h = sec('One-click site themes', tiles + hint('Changes colors, fonts and buttons on your whole site (works with block themes and most classic themes). Your element edits stay on top.'));
		if (t.id) {
			h += sec('Customize “' + esc((THEMES[t.id] || {}).n || 'theme') + '”',
				[['bg', 'Background'], ['surface', 'Cards'], ['text', 'Text'], ['heading', 'Headings'], ['primary', 'Primary'], ['accent', 'Accent']].map(function (p) { return row(p[1], cColor('t:c.' + p[0])); }).join('') +
				row('Heading font', cSelect('t:f.h', FONTS.map(function (f) { return [f[0], f[0]]; }), 'Theme')) +
				row('Body font', cSelect('t:f.b', FONTS.map(function (f) { return [f[0], f[0]]; }), 'Theme')) +
				row('Button radius', cRange('t:r', 0, 40, 1, '', 'data-num')) +
				'<div class="ms-sub">Leave alone</div>' +
				row('', cToggle('t:apply.colors', 'Don’t change colors', false)) + row('', cToggle('t:apply.fonts', 'Don’t change fonts', false)) + row('', cToggle('t:apply.buttons', 'Don’t restyle buttons', false)));
		}
		h += sec('Site extras',
			row('', cToggle('site:progress', 'Reading progress bar (top)', true)) +
			row('', cToggle('site:toTop', 'Back-to-top button', true)) +
			row('', cToggle('site:smooth', 'Smooth scrolling for # links', true)) +
			row('', cToggle('site:pageFade', 'Fade pages in on load', true)) +
			row('Custom cursor', cSelect('site:cursor', [['dot', 'Dot'], ['ring', 'Ring']], 'Off')) +
			row('Text selection', cColor('site:selection')) +
			row('Scrollbar', cColor('site:scrollbar')) + hint('Extras use the theme’s primary/accent colors when a theme is picked.'));
		return h;
	}

	Object.assign(ACTIONS, {
		drawer: function () {
			S.drawer = !S.drawer;
			UI.drawer.classList.toggle('open', S.drawer);
			$('[data-act=drawer]').classList.toggle('on', S.drawer);
			if (S.drawer) renderDrawer();
		},
		theme: function () { S.view = S.view === 'theme' ? 'element' : 'theme'; renderPanel(); },
		'theme-pick': function (b) {
			pushHistory('theme');
			var th = clone(THEMES[b.dataset.id]), old = S.global.theme || {};
			S.global.theme = { id: b.dataset.id, c: th.c, f: th.f, r: th.r, apply: old.apply || {} };
			S.globalDirty = true; markDirty(); updateCss(); renderPanel();
			toast('“' + th.n + '” applied to the whole site', 'ok', UNDO);
		},
		'theme-none': function () { pushHistory('theme'); S.global.theme = {}; S.globalDirty = true; markDirty(); updateCss(); renderPanel(); },
		'state-normal': function () { S.state = 'normal'; forceHover(); renderPanel(); },
		'state-hover': function () { S.state = 'hover'; forceHover(); renderPanel(); toast('Editing HOVER styles – previewed on the selected element'); },
		connect: function () {
			if (!S.el) return;
			S.connecting = cssPath(S.el);
			FD.documentElement.classList.add('ms-mode-pick');
			toast('Now click the element to connect to (Esc to cancel)');
		},
		pick: function (b) {
			S.picking = b.dataset.key;
			FD.documentElement.classList.add('ms-mode-pick');
			toast('Click the target element on the page (Esc to cancel)');
		},
		'set-target': function (b) { setK('r:link.target', b.dataset.sel); renderPanel(); toast('Popup linked ✓', 'ok'); },
		'conn-del': function (b) {
			pushHistory('conn-del');
			[S.page, S.global].forEach(function (d) { d.connectors = d.connectors.filter(function (c) { return c.id !== b.dataset.id; }); });
			S.globalDirty = true; markDirty(); RT.setConnectors(allConns()); renderPanel();
		},
		'select-menu': function () { var m = S.el && S.el.querySelector('nav ul, .menu, ul, nav'); if (m) select(m, true); },
		'select-popup': function () { var p = S.el && S.el.closest('.ms-popup'); if (p) select(p, true); },
		'media-lib': function () { pickMedia(function (m) { placeMedia({ url: m.url, alt: m.alt }, S.el && S.el.tagName === 'IMG' ? { el: S.el, pos: 'replace' } : (S.el ? { el: S.el, pos: 'after' } : null)); }); }
	});

	function runAi() {
		var el = S.el; if (!el) return;
		var pr = $('[data-ai=prompt]', UI.body), md = $('[data-ai=mode]', UI.body);
		if (!pr || !md) return;
		var btnEl = $('[data-act=ai-run]', UI.body); if (btnEl) btnEl.disabled = true;
		toast('Asking Gemini…');
		fetch(CFG.rest + 'ai', {
			method: 'POST', credentials: 'same-origin',
			headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': CFG.nonce },
			body: JSON.stringify({ mode: md.value, prompt: pr.value, text: el.textContent.trim() })
		}).then(function (res) {
			return res.json().then(function (j) { if (!res.ok) throw new Error(j && j.message || res.statusText); return j; });
		}).then(function (j) {
			if (S.el !== el) { toast('Selection changed – nothing applied', 'err'); return; }
			setContent('html', esc(j.text).replace(/\n/g, '<br>'));
			renderPanel();
			toast('Text updated ✨', 'ok', UNDO);
		}).catch(function (e) { toast('AI: ' + e.message, 'err'); })
			.finally(function () { if (btnEl) btnEl.disabled = false; });
	}
	function pickMediaMulti(cb) {
		if (!window.wp || !wp.media) { var u = prompt('Image URL'); if (u) cb([{ url: u }]); return; }
		var frame = wp.media({ title: 'Choose logos', library: { type: 'image' }, multiple: 'add', button: { text: 'Add logos' } });
		frame.on('select', function () { cb(frame.state().get('selection').toJSON()); });
		frame.open();
	}
	function setChildContent(child, f, v) {
		pushHistory('child' + Date.now());
		var r = ensureRuleFor(cssPath(child), friendly(child));
		r.content = r.content || {};
		if (v === '' || v == null) delete r.content[f]; else r.content[f] = v;
		markDirty(r);
		fq(r.selector).forEach(function (el) { RT.applyRuleTo(el, r); });
		updateCss();
	}
	function marqueeTrack() {
		if (!S.el) return null;
		return S.el.matches('.ms-marquee-track') ? S.el : (S.el.querySelector('.ms-marquee-track') || (S.el.closest('.ms-marquee') && S.el.closest('.ms-marquee').querySelector('.ms-marquee-track')));
	}
	function marqueeItems(track, keepText) {
		var kids = Array.prototype.slice.call(track.children), n = kids.length;
		function sig(k) { return k.tagName + (k.getAttribute('src') || '') + k.textContent; }
		var half = n > 1 && n % 2 === 0 && kids.slice(0, n / 2).map(sig).join('|') === kids.slice(n / 2).map(sig).join('|') ? kids.slice(0, n / 2) : kids;
		return half.map(function (k) {
			if (k.tagName === 'IMG') return '<img class="ms-logo-item" src="' + esc(k.getAttribute('src') || '') + '" alt="' + esc(k.getAttribute('alt') || '') + '">';
			return keepText ? '<span>' + esc(k.textContent) + '</span>' : '';
		});
	}
	function setMarquee(track, items, msg) {
		pushHistory('marquee' + Date.now());
		var html = items.join('');
		var r = ensureRuleFor(cssPath(track), 'Logos');
		r.content = r.content || {};
		r.content.html = html + html;
		markDirty(r);
		fq(r.selector).forEach(function (el) { RT.applyRuleTo(el, r); });
		updateCss(); renderPanel(); toast(msg, 'ok');
	}
	Object.assign(ACTIONS, {
		'ai-run': runAi,
		'select-search': function () { var b = S.el && S.el.closest('.ms-search'); if (b) select(b, true); },
		'select-logo': function () { var b = S.el && S.el.closest('.ms-logo-el'); if (b) select(b, true); },
		'logo-pick': function () {
			var img = S.el && S.el.querySelector('img'); if (!img) return;
			pickMedia(function (m) { setChildContent(img, 'src', m.url); setChildContent(img, 'alt', m.alt || m.title || ''); renderPanel(); toast('Logo updated ✓', 'ok'); });
		},
		'logo-site': function () {
			var img = S.el && S.el.querySelector('img'); if (!img || !CFG.siteLogo) return;
			setChildContent(img, 'src', CFG.siteLogo); renderPanel(); toast('Site logo applied ✓', 'ok');
		},
		'logo-header': function () {
			if (!S.el) return;
			addBlock(logoHtml(), { el: S.el, pos: 'prepend' }, [{ s: ' .ms-logo-el', logo: { mode: 'both' } }], 'Logo');
		},
		'search-header': function () {
			if (!S.el) return;
			addBlock('<div class="ms-search"></div>', { el: S.el, pos: 'append' }, [{ s: ' .ms-search', search: { type: 'expand', placeholder: 'Search…', scope: 'all', live: true } }], 'Search bar');
		},
		'marquee-add': function () {
			var tr = marqueeTrack(); if (!tr) return;
			pickMediaMulti(function (list) {
				var add = list.filter(function (m) { return m && m.url; }).map(function (m) { return '<img class="ms-logo-item" src="' + esc(m.url) + '" alt="' + esc(m.alt || m.title || '') + '">'; });
				if (!add.length) return;
				var cur = marqueeItems(tr, true).filter(function (x) { return !/^<span>(BRAND|COMPANY|STUDIO|AGENCY|PARTNER|CLIENT)<\/span>$/.test(x); });
				setMarquee(tr, cur.concat(add), add.length + ' logo(s) added ✓');
			});
		},
		'marquee-clear': function () {
			var tr = marqueeTrack(); if (!tr) return;
			setMarquee(tr, marqueeItems(tr, false), 'Placeholder names removed');
		}
	});

	function forceHover() {
		if (!FD) return;
		fq('.ms-force-hover').forEach(function (n) { n.classList.remove('ms-force-hover'); });
		if (S.state === 'hover' && S.el) fq(S.sel).forEach(function (n) { n.classList.add('ms-force-hover'); });
	}

	/* ==================================================================
	 * 7. UX – dialogs, tooltips, welcome guide, search, previews,
	 *    drafts, dark mode, simple/advanced
	 * ================================================================== */

	function store(k, v) {
		try { if (v === undefined) return JSON.parse(localStorage.getItem('ms-' + k)); if (v === null) localStorage.removeItem('ms-' + k); else localStorage.setItem('ms-' + k, JSON.stringify(v)); } catch (e) { return null; }
	}

	/* ---------- dialogs ---------- */
	function modal(html, cls) {
		var bg = document.createElement('div');
		bg.className = 'ms-modal-bg';
		bg.innerHTML = '<div class="ms-modal ' + (cls || '') + '" role="dialog" aria-modal="true">' + html + '</div>';
		document.body.appendChild(bg);
		return bg;
	}
	/* Resolves 1 = OK, 2 = alternative, 0 = cancel. */
	function ask(o) {
		return new Promise(function (res) {
			var bg = modal('<h3>' + esc(o.title) + '</h3><p>' + (o.html || esc(o.text || '')) + '</p><div class="ms-modal-actions">' +
				(o.cancel !== false ? '<button type="button" class="ms-btn" data-r="0">' + esc(o.cancel || 'Cancel') + '</button>' : '') +
				(o.alt ? '<button type="button" class="ms-btn" data-r="2">' + esc(o.alt) + '</button>' : '') +
				'<button type="button" class="ms-btn ' + (o.danger ? 'ms-danger' : 'ms-primary') + '" data-r="1">' + esc(o.ok || 'OK') + '</button></div>');
			bg.querySelector('[data-r="1"]').focus();
			function done(v) { bg.remove(); document.removeEventListener('keydown', key, true); res(v); }
			function key(e) {
				if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); done(0); }
				else if (e.key === 'Enter') { e.stopPropagation(); e.preventDefault(); done(1); }
			}
			document.addEventListener('keydown', key, true);
			bg.addEventListener('click', function (e) { var b = e.target.closest('[data-r]'); if (b) done(+b.dataset.r); else if (e.target === bg) done(0); });
		});
	}

	/* ---------- tooltips (replace native titles in the editor UI) ---------- */
	function bindTooltips() {
		var tip = document.createElement('div'); tip.className = 'ms-tip'; document.body.appendChild(tip);
		var cur = null, timer = 0;
		document.addEventListener('mouseover', function (e) {
			var t = e.target.closest && e.target.closest('#ms-app [title], #ms-app [data-tip]');
			if (t === cur) return;
			cur = t; clearTimeout(timer); tip.classList.remove('on');
			if (!t) return;
			if (t.hasAttribute('title')) { t.setAttribute('data-tip', t.getAttribute('title')); t.removeAttribute('title'); }
			var text = t.getAttribute('data-tip'); if (!text) return;
			timer = setTimeout(function () {
				var m = text.match(/^(.*?)\s*\[(.+)\]$/);
				tip.innerHTML = esc(m ? m[1] : text) + (m ? '<kbd>' + esc(m[2]) + '</kbd>' : '');
				var r = t.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
				var top = r.bottom + 8; if (top + h > innerHeight - 8) top = r.top - h - 8;
				tip.style.top = top + 'px';
				tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
				tip.classList.add('on');
			}, 350);
		});
		document.addEventListener('mousedown', function () { clearTimeout(timer); tip.classList.remove('on'); });
	}

	/* ---------- welcome guide ---------- */
	var WELCOME = [
		['👋', 'Welcome to Motion Studio', 'Design your WordPress site visually – no code. Here’s a 20-second tour.'],
		['👆', 'Click anything to edit it', 'Click any part of your page. A small toolbar appears next to it and the panel on the right shows its options. <b>Double-click text</b> to type over it.'],
		['＋', 'Drag new things in', 'Press <b>+ Add</b> to drag elements, ready-made sections, frames and images onto the page. Drag the <b>⠿</b> handle to rearrange anything.'],
		['✨', 'Make it move', 'Use <b>Animate</b>, <b>Effects</b> and <b>Text</b> to bring it alive – or let <b>✨ Auto-animate</b> do the whole page. Use the device icons at the top for tablet & phone.'],
		['💾', 'Save when you’re happy', 'Press <b>Save</b> (Ctrl+S). Your work is also kept as a draft in this browser, just in case. You can reopen this guide from the <b>⋯</b> menu.']
	];
	function showWelcome() {
		var i = 0, bg = modal('', 'ms-welcome');
		var box = bg.firstChild;
		function draw() {
			var w = WELCOME[i], last = i === WELCOME.length - 1;
			box.innerHTML = '<div class="ms-wl-art">' + w[0] + '</div><div class="ms-wl-body"><h3>' + w[1] + '</h3><p>' + w[2] + '</p><div class="ms-wl-foot">' +
				'<div class="ms-wl-dots">' + WELCOME.map(function (x, j) { return '<i class="' + (j === i ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
				'<div class="ms-modal-actions" style="margin:0">' + (i ? '<button type="button" class="ms-btn" data-w="back">Back</button>' : '<button type="button" class="ms-btn" data-w="skip">Skip</button>') +
				'<button type="button" class="ms-btn ms-primary" data-w="' + (last ? 'done' : 'next') + '">' + (last ? 'Start designing' : 'Next') + '</button></div></div></div>';
			box.querySelector('.ms-primary').focus();
		}
		function close() { bg.remove(); store('welcomed', 1); document.removeEventListener('keydown', key, true); }
		function key(e) {
			if (e.key === 'Escape') { e.stopPropagation(); close(); }
			if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); if (i < WELCOME.length - 1) { i++; draw(); } else close(); }
			if (e.key === 'ArrowLeft' && i) { i--; draw(); }
		}
		bg.addEventListener('click', function (e) {
			var b = e.target.closest('[data-w]'); if (!b) return;
			var w = b.dataset.w;
			if (w === 'next') { i++; draw(); } else if (w === 'back') { i--; draw(); } else close();
		});
		document.addEventListener('keydown', key, true);
		draw();
	}

	function showShortcuts() {
		var rows = [['Click', 'Select an element'], ['Double-click', 'Edit text / replace image'], ['Ctrl + S', 'Save'], ['Ctrl + Z / Ctrl + Y', 'Undo / redo'],
			['Ctrl + K', 'Search everything'], ['A', 'Open / close the Add panel'], ['Esc', 'Deselect, cancel, finish typing'], ['↑', 'Select the parent element'],
			['Alt + ↑ / Alt + ↓', 'Move element up / down'], ['Ctrl + D', 'Duplicate'], ['Delete', 'Delete added block / hide element'], ['Ctrl + C / Ctrl + V', 'Copy / paste style'],
			['L', 'Drag & resize mode'], ['P', 'Preview mode'], ['?', 'This list']];
		var bg = modal('<h3>Keyboard shortcuts</h3><table class="ms-keys">' + rows.map(function (r) { return '<tr><td>' + r[0].split(' / ').map(function (k) { return k.split(' + ').map(function (x) { return '<kbd>' + esc(x) + '</kbd>'; }).join(' + '); }).join(' / ') + '</td><td>' + r[1] + '</td></tr>'; }).join('') +
			'</table><div class="ms-modal-actions"><button type="button" class="ms-btn ms-primary" data-close>Got it</button></div>');
		function close() { bg.remove(); document.removeEventListener('keydown', key, true); }
		function key(e) { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); close(); } }
		bg.addEventListener('click', function (e) { if (e.target === bg || e.target.closest('[data-close]')) close(); });
		document.addEventListener('keydown', key, true);
	}

	/* ---------- search everything (Ctrl+K) ---------- */
	function searchIndex() {
		var out = [], needEl = function (fn) { return function () { if (!S.el) { toast('Select an element on the page first'); return; } fn(); }; };
		var add = function (label, kind, run, icn) { out.push({ l: label, k: kind, run: run, i: icn || '' }); };
		[['Save', function () { ACTIONS.save(); }], ['Undo', function () { ACTIONS.undo(); }], ['Redo', function () { ACTIONS.redo(); }], ['Preview mode', function () { ACTIONS.interact(); }],
			['Auto-animate this page', function () { ACTIONS.auto(); }], ['Replay animations', function () { ACTIONS.replay(); }], ['Dark mode on/off', function () { ACTIONS.dark(); }],
			['Keyboard shortcuts', showShortcuts], ['Welcome guide', showWelcome], ['Desktop view', function () { setDevice('desktop'); }], ['Tablet view', function () { setDevice('tablet'); }],
			['Phone view', function () { setDevice('mobile'); }], ['Site theme & extras', function () { S.view = 'theme'; renderPanel(); }], ['Add panel', function () { if (!S.drawer) ACTIONS.drawer(); }]
		].forEach(function (c) { add(c[0], 'Command', c[1], '⌘'); });
		var drop = function (kind, id) { return function () { libClick({ dataset: { kind: kind, id: id } }); }; };
		ELEMENTS.forEach(function (e) { add('Add ' + e.n, 'Element', drop('el', e.id), e.i); });
		SECTIONS.forEach(function (x) { add('Add section: ' + x.n, 'Section', drop('sec', x.id), '▤'); });
		IN_LIST.forEach(function (a) { add('Entrance: ' + title(a), 'Animation', needEl(function () { setK('r:anim.in', a); S.tab = 'animate'; renderPanel(); }), '▶'); });
		OUT_LIST.forEach(function (a) { add('Exit: ' + title(a), 'Animation', needEl(function () { setK('r:anim.out', a); if (!(rule().anim || {}).outTrigger) setK('r:anim.outTrigger', 'leave'); S.tab = 'animate'; renderPanel(); }), '◀'); });
		LOOP_LIST.forEach(function (a) { add('Loop: ' + title(a), 'Animation', needEl(function () { setK('r:loop.type', a); S.tab = 'animate'; renderPanel(); }), '↻'); });
		FX_GROUPS.forEach(function (g) {
			g[1].forEach(function (f) {
				add('Effect: ' + title(f), g[0], needEl(function () { var l = (getK('r:fx.list') || []).slice(); if (l.indexOf(f) < 0) l.push(f); setK('r:fx.list', l); S.tab = 'fx'; renderPanel(); toast('Added effect: ' + title(f), 'ok', UNDO); }), '✦');
			});
		});
		Object.keys(TEXT_PRESETS).forEach(function (k) { add('Text style: ' + TEXT_PRESETS[k].n, 'Text', needEl(function () { setK('r:text.preset', k); S.tab = 'text'; renderPanel(); }), 'Aa'); });
		Object.keys(FRAMES).forEach(function (k) { add('Frame: ' + FRAMES[k].n, 'Frame', function () { if (S.el && S.el.tagName === 'IMG') { setK('r:frame', k); S.tab = 'edit'; renderPanel(); } else drop('frame', k)(); }, '◯'); });
		RECIPES.forEach(function (r, i) { add('Recipe: ' + r.n, 'One-click', needEl(function () { applyRecipe(i); }), r.i); });
		Object.keys(THEMES).forEach(function (k) { add('Theme: ' + THEMES[k].n, 'Site theme', function () { ACTIONS['theme-pick']({ dataset: { id: k } }); }, '🎨'); });
		Object.keys(MENU_STYLES).forEach(function (k) { add('Menu style: ' + MENU_STYLES[k].n, 'Menu', needEl(function () { setK('r:menu.style', k); S.tab = 'edit'; renderPanel(); }), '☰'); });
		return out;
	}
	function showSearch() {
		var idx = searchIndex(), sel = 0, results = [];
		var bg = modal('<div class="ms-search-in">' + icon('search') + '<input type="text" placeholder="Search animations, effects, text styles, frames, elements…" aria-label="Search"></div><div class="ms-search-list" role="listbox"></div>' +
			'<div class="ms-search-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> to choose</span><span><kbd>Enter</kbd> to apply</span><span><kbd>Esc</kbd> to close</span>' + (S.el ? '<span style="margin-left:auto">Applies to: <b>' + esc(friendly(S.el)) + '</b></span>' : '') + '</div>', 'ms-search');
		var input = bg.querySelector('input'), list = bg.querySelector('.ms-search-list');
		function draw() {
			var q = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
			results = q.length ? idx.filter(function (it) { var t = (it.l + ' ' + it.k).toLowerCase(); return q.every(function (w) { return t.indexOf(w) > -1; }); }) : idx.filter(function (it) { return it.k === 'Command' || it.k === 'One-click'; });
			results = results.slice(0, 60);
			sel = Math.min(sel, Math.max(0, results.length - 1));
			list.innerHTML = results.length ? results.map(function (it, i) { return '<button type="button" data-i="' + i + '" class="' + (i === sel ? 'on' : '') + '"><span style="width:22px;text-align:center">' + it.i + '</span>' + esc(it.l) + '<small>' + esc(it.k) + '</small></button>'; }).join('')
				: '<div class="ms-empty">No matches. Try “fade”, “glitch”, “neon”, “heart”, “button”…</div>';
			var on = list.querySelector('.on'); if (on) on.scrollIntoView({ block: 'nearest' });
		}
		function run(i) { var it = results[i]; close(); if (it) it.run(); }
		function close() { bg.remove(); document.removeEventListener('keydown', key, true); }
		function key(e) {
			if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
			else if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(results.length - 1, sel + 1); draw(); }
			else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); draw(); }
			else if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); run(sel); }
		}
		input.addEventListener('input', function () { sel = 0; draw(); });
		list.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) run(+b.dataset.i); });
		bg.addEventListener('mousedown', function (e) { if (e.target === bg) close(); });
		document.addEventListener('keydown', key, true);
		draw(); input.focus();
	}

	/* ---------- live previews when hovering animation / effect tiles ---------- */
	function bindPreviews() {
		var last = null;
		UI.body.addEventListener('mouseover', function (e) {
			var t = e.target.closest && e.target.closest('.ms-anim-tiles button, .ms-fx-tiles button');
			if (!t || t === last || !RT) { if (!t) last = null; return; }
			last = t;
			var dot = t.querySelector('.ms-prev-dot'), k = t.parentNode.dataset.k, v = t.dataset.v;
			if (!dot) return;
			dot.getAnimations().forEach(function (a) { a.cancel(); });
			dot.className = 'ms-prev-dot';
			try {
				if (k === 'r:anim.in' && RT.IN[v]) dot.animate(RT.IN[v](14), { duration: 750, easing: 'cubic-bezier(.22,.61,.36,1)' });
				else if (k === 'r:anim.out' && RT.IN[v]) dot.animate(RT.IN[v](14), { duration: 750, direction: 'reverse', easing: 'cubic-bezier(.22,.61,.36,1)' });
				else if (k === 'r:loop.type' && RT.LOOP[v]) dot.animate(RT.LOOP[v], { duration: 1100, iterations: 2 });
				else if (k === 'r:fx.list') {
					dot.classList.add('ms-fx', 'ms-fx-' + (v === 'glitch' || v === 'rgb-split' ? v + '-box' : v));
					setTimeout(function () { dot.className = 'ms-prev-dot'; }, 2200);
				}
			} catch (err) {}
		});
	}

	/* ---------- drafts (never lose work) ---------- */
	var draftTimer = 0;
	function queueDraft() {
		clearTimeout(draftTimer);
		draftTimer = setTimeout(function () {
			if (!S.key || !S.dirty) return;
			store('draft-' + S.key, { t: Date.now(), page: S.page, global: S.global, gd: S.globalDirty });
		}, 1200);
	}
	function clearDraft() { clearTimeout(draftTimer); if (S.key) store('draft-' + S.key, null); }
	function offerDraft() {
		var d = store('draft-' + S.key);
		if (!d || !d.page) return;
		if (JSON.stringify(d.page) === JSON.stringify(S.page) && JSON.stringify(d.global) === JSON.stringify(S.global)) { clearDraft(); return; }
		var mins = Math.max(1, Math.round((Date.now() - d.t) / 60000));
		ask({ title: 'Restore unsaved changes?', text: 'You have changes on this page from ' + (mins < 60 ? mins + ' min' : Math.round(mins / 60) + ' h') + ' ago that were never saved.', ok: 'Restore them', cancel: 'Discard' }).then(function (r) {
			if (r !== 1) { clearDraft(); return; }
			S.page = normalize(d.page); S.global = normalize(d.global); S.globalDirty = !!d.gd;
			markDirty();
			reloadFrame();
			toast('Draft restored – remember to Save', 'ok');
		});
	}

	/* ---------- dark mode, menus, modes ---------- */
	function applyDark() {
		document.body.classList.toggle('ms-dark', !!S.dark);
		var l = $('.ms-dark-lbl'); if (l) l.textContent = S.dark ? 'Light mode' : 'Dark mode';
	}
	Object.assign(ACTIONS, {
		menu: function () { UI.menu.classList.toggle('open'); },
		dark: function () { S.dark = !S.dark; store('dark', S.dark); applyDark(); },
		shortcuts: showShortcuts,
		welcome: showWelcome,
		search: showSearch,
		'mode-simple': function () { S.adv = false; store('adv', false); renderPanel(); },
		'mode-adv': function () { S.adv = true; store('adv', true); renderPanel(); toast('Advanced options shown'); }
	});
	document.addEventListener('mousedown', function (e) { if (UI.menu && !e.target.closest('.ms-menu-wrap')) UI.menu.classList.remove('open'); });

	function initUX() {
		S.dark = !!store('dark');
		S.adv = !!store('adv');
		S.secState = store('sec') || {};
		applyDark();
		bindTooltips();
		bindPreviews();
		// remember which panel sections are open
		UI.body.addEventListener('toggle', function (e) {
			var d = e.target; if (!d.dataset || !d.dataset.sec) return;
			S.secState[d.dataset.sec] = d.open; store('sec', S.secState);
		}, true);
		// drawer search
		UI.drawer.addEventListener('input', function (e) {
			if (!e.target.hasAttribute('data-dsearch')) return;
			var q = e.target.value.toLowerCase().trim();
			$$('.ms-lib', UI.dbody).forEach(function (t) { t.style.display = !q || t.textContent.toLowerCase().indexOf(q) > -1 || (t.dataset.id || '').indexOf(q) > -1 ? '' : 'none'; });
		});
		if (!store('welcomed')) setTimeout(showWelcome, 600);
	}

	/* ---------- boot ---------- */
	function boot() {
		// Fonts used by text-style previews in the panel.
		loadFonts(document, Object.keys(TEXT_PRESETS).filter(function (k) { return TEXT_PRESETS[k].font; }).map(function (k) { var f = FONT_MAP[TEXT_PRESETS[k].font]; return f[0] + ':' + f[1]; }));
		buildShell();
		initUX();
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

	// Exposed for debugging / extensions.
	window.MotionStudioEditor = { state: S, genCss: genCss, save: save, TEXT_PRESETS: TEXT_PRESETS, RECIPES: RECIPES };
})();
