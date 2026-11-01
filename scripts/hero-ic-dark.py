# Темные варианты иконок хиро. Оригиналы - пастельные наклейки на белой
# подложке, на светлой странице сложены multiply. Для темной страницы
# делаем "призраков": альфа = затемненность пикселя относительно базы 252
# (отсекает белую дымку мягких теней), цвет - чистый светлый, чтобы на
# темном фоне читался силуэт наклейки, а не грязное пятно.
from PIL import Image
import numpy as np
import os

SRC = 'public/img/hero/ic'
DST = 'public/img/hero/ic-dark'
BASE = 252.0   # база белого: все светлее - прозрачное
GAIN = 10.0    # усиление: ядра форм (люма 235-245) -> альфа 70-170
CAP = 170.0    # потолок альфы, иконки остаются тихими
TINT = (232, 244, 238)  # холодный белый с легкой мятой под фирменный фон

os.makedirs(DST, exist_ok=True)
for f in sorted(os.listdir(SRC)):
    if not f.endswith('.webp'):
        continue
    im = Image.open(f'{SRC}/{f}').convert('RGB')
    luma = np.array(im.convert('L'), dtype=np.float32)
    alpha = np.clip((BASE - luma) * GAIN, 0, CAP).astype(np.uint8)
    h, w = alpha.shape
    rgb = np.empty((h, w, 3), dtype=np.uint8)
    rgb[...] = TINT
    rgba = np.dstack([rgb, alpha])
    Image.fromarray(rgba, 'RGBA').save(f'{DST}/{f}', lossless=False, quality=90)
    print(f'{f}: max alpha {alpha.max()}, mean {alpha.mean():.1f}')
