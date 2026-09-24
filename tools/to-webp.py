# Фотографии в webp: рядом с каждым jpg кладётся webp того же имени.
# Сборка подменяет расширение в src, ссылки на сканы остаются на jpg.
from PIL import Image
import glob, os

tin = tout = 0
n = 0
for p in glob.glob('img/**/*.jpg', recursive=True):
    key = p.replace(os.sep, '/')
    im = Image.open(p).convert('RGB')
    w = 760 if '/fleet/' in key else 1000
    if im.width > w:
        im = im.resize((w, max(1, round(im.height * w / im.width))), Image.LANCZOS)
    out = os.path.splitext(p)[0] + '.webp'
    im.save(out, 'WEBP', quality=76, method=6)
    tin += os.path.getsize(p)
    tout += os.path.getsize(out)
    n += 1
print('конвертировано %d: %.2f МБ jpg -> %.2f МБ webp' % (n, tin / 1048576, tout / 1048576))
