// Иллюстрации написаны в пикселях макета. Здесь px превращаются в доли ширины карточки,
// чтобы картинка масштабировалась вместе с ней. 1PX остается настоящим пикселем.
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync(new URL('../src/styles/illus.src.css', import.meta.url), 'utf8');
const out = src.replace(/(-?\d*\.?\d+)px/g, 'calc($1 * var(--u))').replace(/PX/g, 'px');
writeFileSync(new URL('../src/styles/illus.css', import.meta.url), '/* Собрано из illus.src.css, руками не править */\n' + out);
