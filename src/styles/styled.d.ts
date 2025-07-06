import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    fonts: {
      mainTitle: ReturnType<typeof css>;
      heading: ReturnType<typeof css>;
      default: ReturnType<typeof css>;
      default0: ReturnType<typeof css>;
      default1: ReturnType<typeof css>;
      default2: ReturnType<typeof css>;
      default3: ReturnType<typeof css>;
      helperText: ReturnType<typeof css>;
      BigButton: ReturnType<typeof css>;
      SmallButton: ReturnType<typeof css>;
      subTitle: ReturnType<typeof css>;
    };
    colors: {
      red1: string;
      red2: string;
      red3: string;
      pink1: string;
      pink2: string;
      pink3: string;
      pink4: string;
      pink5: string;
      gray: string;
      gray0: string;
      gray1: string;
      gray2: string;
      gray3: string;
      gray4: string;
      gray5: string;
      lightgray: string;
      black: string;
      white: string;
      blue: string;
      yellow: string;
      yellow0: string;
      yellow1: string;
      yellow2: string;
      yellow3: string;
      yellow4: string;
      yellow5: string;
      WhiteBrown1: string;
      WhiteBrown2: string;
      WhiteBrown3: string;
      WhiteBrown4: string;
      WhiteBrown5: string;
      WhiteBrown6: string;
      DarkBrown1: string;
      DarkBrown2: string;
      DarkBrown3: string;
      DarkBrown4: string;
      DarkBrown5: string;
      DarkBrown6: string;
      PinkBrown1: string;
      PinkBrown2: string;
      PinkBrown3: string;
      PinkBrown4: string;
      PinkBrown5: string;
      Black1: string;
    };
    breakpoints: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
  }
}
