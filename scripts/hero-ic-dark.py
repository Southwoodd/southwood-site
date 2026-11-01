# Темные варианты иконок хиро. Оригиналы - пастельные логотипы на белой
# подложке, на светлой странице сложены multiply. Для темной страницы
# подложку убираем в прозрачность: альфа = затемненность пикселя, цвет
# сохраняется. Получаются призрачные цветные логотипы на темном фоне.
from PIL import Image
import numpy as np
import os

SRC = 'public/img/hero/ic'
DST = 'public/img/hero/ic-dark'
BOOST = 2.0  # усиление альфы: пастель сама по себе очень светлая

os.makedirs(DST, exist_ok=True)
for f in sorted(os.listdir(SRC)):
    if not f.endswith('.webp'):
        continue
    im = Image.open(f'{SRC}/{f}').convert('RGB')
    luma = np.array(im.convert('L'), dtype=np.float32)
    alpha = np.clip((255.0 - luma) * BOOST, 0, 255).astype(np.uint8)
    rgba = np.dstack([np.array(im), alpha])
    Image.fromarray(rgba, 'RGBA').save(f'{DST}/{f}', lossless=False, quality=90)
    print(f'{f}: max alpha {alpha.max()}, mean {alpha.mean():.1f}')
