// src/config/sizeGuideConfig.ts

import BlouseImg from 'src/assets/category/Blouse.svg';
import MiniSkirtImg from 'src/assets/category/MiniSkirt.svg';
import TshirtImg from 'src/assets/category/Tshirt.svg';
import MidiSkirtImg from 'src/assets/category/MidiSkirt.svg';
import BestImg from 'src/assets/category/Best.svg';
import KnitTopImg from 'src/assets/category/KnitTop.svg';
import LongSkirtImg from 'src/assets/category/LongSkirt.svg';
import PantsImg from 'src/assets/category/Pants.svg';
import MiniDressImg from 'src/assets/category/MiniDress.svg';
import MidiDressImg from 'src/assets/category/MidiDress.svg';
import LongDressImg from 'src/assets/category/LongDress.svg';
// import TwoDressImg from 'src/assets/category/LongDress.svg';
import JacketImg from 'src/assets/category/Jacket.svg';
import CardiganImg from 'src/assets/category/Cardigan.svg';
import PaddingImg from 'src/assets/category/Padding.svg';
import CoatImg from 'src/assets/category/Coat.svg';
import TopImg from 'src/assets/category/Top.svg';
import ShirtsImg from 'src/assets/category/ShirtTop.svg';
import JumpSuitImg from 'src/assets/category/JumpSuit.svg';
export interface SizeGuideConfigItem {
  image: string;
  labels: Record<string, string>;
}

export const sizeGuideConfig: Record<string, SizeGuideConfigItem> = {
  Entire: {
    image:
      'https://daehyuninside.wisacdn.com/_data/product/sizeimg/6aa5cfc1fcf058242047931081e6bd5c.svg',
    labels: {
      A: 'A.어깨넓이',
      B: 'B.가슴둘레',
      C: 'C.소매길이',
      D: 'D.암홀',
      E: 'E.총길이',
    },
  },
  Top: {
    image: TopImg,
    labels: {
      A: 'A.어깨넓이',
      B: 'B.가슴둘레',
      C: 'C.암홀',
      D: 'D.총길이',
    },
  },
  Tshirt: {
    image: TshirtImg,
    labels: {
      A: 'A.어깨넓이',
      B: 'B.가슴둘레',
      C: 'C.소매길이',
      D: 'D.암홀',
      E: 'E.총길이',
      F: 'F.밑단둘레',
    },
  },
  Blouse: {
    image: BlouseImg,
    labels: {
      A: 'A.어깨넓이',
      B: 'B.가슴둘레',
      C: 'C.소매길이',
      D: 'D.암홀',
      E: 'E.총길이',
    },
  },
  KnitTop: {
    image: KnitTopImg,
    labels: {
      A: 'A.어깨넓이',
      B: 'B.가슴둘레',
      C: 'C.소매길이',
      D: 'D.암홀',
      E: 'E.총길이',
      F: 'F.밑단둘레',
    },
  },
  ShirtTop: {
    image: ShirtsImg,
    labels: {
      A: 'A.어깨넓이',
      B: 'B.가슴둘레',
      C: 'C.소매길이',
      D: 'D.암홀',
      E: 'E.총길이',
    },
  },
  MiniSkirt: {
    image: MiniSkirtImg,
    labels: {
      A: 'A.허리둘레',
      B: 'B.엉덩이둘레',
      C: 'C.밑단둘레',
      D: 'D.총길이',
    },
  },
  MidiSkirt: {
    image: MidiSkirtImg,
    labels: {
      A: 'A.허리둘레',
      B: 'B.엉덩이둘레',
      C: 'C.밑단둘레',
      D: 'D.총길이',
    },
  },
  LongSkirt: {
    image: LongSkirtImg,
    labels: {
      A: 'A.허리둘레',
      B: 'B.엉덩이둘레',
      C: 'C.밑단둘레',
      D: 'D.총길이',
    },
  },
  Pants: {
    image: PantsImg,
    labels: {
      A: 'A.허리둘레',
      B: 'B.엉덩이둘레',
      C: 'C.허벅지둘레',
      D: 'D.밑위길이',
      E: 'E.총길이',
      F: 'F.밑단둘레',
    },
  },
  MiniDress: {
    image: MiniDressImg,
    labels: {
      A: 'A.어깨넓이',
      B: 'B.가슴둘레',
      C: 'C.허리둘레',
      D: 'D.소매길이',
      E: 'E.엉덩이둘레',
      F: 'F.총길이',
    },
  },
  MidiDress: {
    image: MidiDressImg,
    labels: {
      A: 'A.어깨넓이',
      B: 'B.가슴둘레',
      C: 'C.허리둘레',
      D: 'D.소매길이',
      E: 'E.엉덩이둘레',
      F: 'F.총길이',
    },
  },
  LongDress: {
    image: LongDressImg,
    labels: {
      A: 'A.어깨넓이',
      B: 'B.가슴둘레',
      C: 'C.허리둘레',
      D: 'D.소매길이',
      E: 'E.엉덩이둘레',
      F: 'F.총길이',
    },
  },
  TwoDress: {
    image: LongDressImg,
    labels: {
      A: 'A.어깨넓이',
      B: 'B.가슴둘레',
      C: 'C.허리둘레',
      D: 'D.소매길이',
      E: 'E.엉덩이둘레',
      F: 'F.총길이',
    },
  },
  JumpSuit: {
    image: JumpSuitImg,
    labels: {
      A: 'A.어깨넓이',
      B: 'B.가슴둘레',
      C: 'C.허리둘레',
      D: 'D.소매길이',
      E: 'E.총길이',
    },
  },
  Best: {
    image: BestImg,
    labels: {
      A: 'A.어깨넓이',
      B: 'B.가슴둘레',
      C: 'C.허리둘레',
      D: 'D.암홀',
      E: 'E.총길이',
      F: 'F.밑단둘레',
    },
  },
  Cardigan: {
    image: CardiganImg,
    labels: {
      A: 'A.어깨넓이',
      B: 'B.가슴둘레',
      C: 'C.소매길이',
      D: 'D.암홀',
      E: 'E.총길이',
      F: 'F.밑단둘레',
    },
  },
  Jacket: {
    image: JacketImg,
    labels: {
      A: 'A.어깨넓이',
      B: 'B.가슴둘레',
      C: 'C.허리둘레',
      D: 'D.소매길이',
      E: 'E.암홀',
      F: 'F.총길이',
      G: 'G.밑단둘레',
    },
  },
  Padding: {
    image: PaddingImg,
    labels: {
      A: 'A.어깨넓이',
      B: 'B.가슴둘레',
      C: 'C.소매길이',
      D: 'D.암홀',
      E: 'E.총길이',
      F: 'F.밑단둘레',
    },
  },
  Coat: {
    image: CoatImg,
    labels: {
      A: 'A.어깨넓이',
      B: 'B.가슴둘레',
      C: 'C.허리둘레',
      D: 'D.소매길이',
      E: 'E.암홀',
      F: 'F.총길이',
      G: 'G.밑단둘레',
    },
  },
};
