import os
from pathlib import Path
from itertools import chain
import cairosvg

SRC = Path('src')
SRC_ICONS = SRC / 'icons'
DIST = Path('dist')
SHAPES = ['rect', 'round', 'square']
SIZE = 200
COLORS = {
    'Yeallow': '#ffda44',
    'Orange': '#ff9811',
    'Red': '#d80027',
    'Dark Red': '#a2001d',
    'Brown': '#d57800',
    'Green': '#6da544',
    'Dark Green': '#496e2d',
    'Blue': '#0052b4',
    'Dark Blue': '#338af3',
    'White': '#f0f0f0',
    'Gray': '#acabb1',
    'Black': '#000000',
    'Quatar (QA) flag': '#751a46'
}
# TODO:
# change Gray to #acabaf
# generate color map

if not DIST.is_dir():
    DIST.mkdir()

def svgo(input_, output):
    os.system(f'svgo -p 3 --pretty --multipass --config=build.config.yml "{input_}" -o "{output}"')

def resize(input_, output):
    os.system(f'magick "{input_}" -resize x{SIZE} +dither -quality 90 "{output}"')

def svg2png(input_, output):
    cairosvg.svg2png(
        url=str(input_),
        write_to=str(output),
        output_height=SIZE,
    )

for path in chain(SRC_ICONS.glob('*.svg'), SRC.glob('*.svg')):
    input_ = DIST / f'{path.stem}.svg'
    svgo(path, input_)
    if SIZE is not None:
        output = DIST / f'{path.stem}.png'
        svg2png(input_, output)
        resize(output, output)
