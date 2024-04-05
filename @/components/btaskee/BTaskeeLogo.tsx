import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export const Logo = ({
  className,
  ...props
}: HTMLAttributes<SVGSVGElement>) => {
  return (
    <svg
      width="169"
      height="42"
      viewBox="0 0 169 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      {...props}>
      <path
        d="M67.705 17.3099C68.9211 17.955 69.8742 18.852 70.5644 20.0322C71.2546 21.1967 71.5997 22.55 71.5997 24.0764C71.5997 25.6029 71.2546 26.9562 70.5644 28.1364C69.8742 29.3166 68.9211 30.2293 67.705 30.8745C66.4889 31.5197 65.125 31.8344 63.5802 31.8344C62.4956 31.8344 61.5096 31.6613 60.6058 31.2994C59.702 30.9374 58.9625 30.4024 58.338 29.6785V31.6298H54.8213V10.6377H58.5188V18.3642C59.1432 17.7033 59.8992 17.1997 60.7537 16.8692C61.6082 16.523 62.5449 16.3657 63.5802 16.3657C65.125 16.3499 66.4889 16.6804 67.705 17.3099ZM66.5218 27.5069C67.3928 26.6414 67.8365 25.4927 67.8365 24.0764C67.8365 22.6602 67.3928 21.5114 66.5218 20.6459C65.6508 19.7804 64.5334 19.3398 63.1694 19.3398C62.282 19.3398 61.4768 19.5287 60.7701 19.9221C60.0635 20.3155 59.5048 20.8662 59.0775 21.5744C58.6667 22.2982 58.453 23.1165 58.453 24.0607C58.453 25.0049 58.6667 25.8389 59.0775 26.547C59.4883 27.2709 60.0471 27.8217 60.7701 28.1993C61.4768 28.5927 62.282 28.7816 63.1694 28.7816C64.5334 28.813 65.6508 28.3724 66.5218 27.5069Z"
        fill="#FF8228"
      />
      <path
        d="M76.875 13.7535H70.0059V10.6377H87.5731V13.7535H80.7204V31.6456H76.875V13.7535Z"
        fill="#FF8228"
      />
      <path
        d="M98.3038 17.9548C99.5363 19.0249 100.144 20.63 100.144 22.7858V31.6453H96.6604V29.8042C96.2003 30.4651 95.5594 30.9687 94.7213 31.3149C93.8832 31.6611 92.8808 31.8342 91.6976 31.8342C90.5144 31.8342 89.4791 31.6453 88.5917 31.2519C87.7043 30.8585 87.0141 30.3235 86.5375 29.6311C86.0609 28.9387 85.8145 28.1676 85.8145 27.3021C85.8145 25.9488 86.3403 24.8473 87.392 24.029C88.4438 23.2107 90.1035 22.8016 92.3713 22.8016H96.4468V22.5813C96.4468 21.5269 96.1181 20.7087 95.4608 20.1422C94.8035 19.5756 93.8175 19.2924 92.5192 19.2924C91.6318 19.2924 90.7609 19.4183 89.9063 19.6858C89.0518 19.9533 88.3287 20.3153 87.7372 20.7873L86.291 18.2066C87.1127 17.6086 88.1151 17.1365 89.2819 16.8218C90.4486 16.5071 91.6811 16.334 92.9794 16.334C95.28 16.3497 97.0713 16.8848 98.3038 17.9548ZM94.9185 28.6555C95.6416 28.2463 96.151 27.6641 96.4468 26.9087V25.1463H92.6343C90.4979 25.1463 89.4462 25.8229 89.4462 27.1605C89.4462 27.8057 89.7091 28.3093 90.2514 28.6869C90.7773 29.0646 91.5168 29.2534 92.4699 29.2534C93.3902 29.2692 94.2119 29.0646 94.9185 28.6555Z"
        fill="#FF8228"
      />
      <path
        d="M105.403 31.3625C104.187 31.0477 103.201 30.6386 102.478 30.1508L103.891 27.4599C104.597 27.9162 105.452 28.2782 106.454 28.5457C107.457 28.8132 108.426 28.9548 109.396 28.9548C111.598 28.9548 112.715 28.4041 112.715 27.2868C112.715 26.7517 112.436 26.3898 111.877 26.1852C111.319 25.9807 110.415 25.7761 109.166 25.5873C107.868 25.3984 106.8 25.1781 105.994 24.9421C105.173 24.6903 104.466 24.2654 103.858 23.6517C103.25 23.038 102.954 22.1882 102.954 21.0867C102.954 19.6547 103.579 18.506 104.828 17.6405C106.076 16.775 107.769 16.3501 109.905 16.3501C110.99 16.3501 112.075 16.476 113.159 16.6963C114.244 16.9323 115.131 17.2471 115.821 17.6405L114.408 20.3314C113.061 19.576 111.565 19.1984 109.889 19.1984C108.804 19.1984 107.983 19.3557 107.424 19.6704C106.865 19.9852 106.586 20.3943 106.586 20.8979C106.586 21.4644 106.882 21.8578 107.49 22.0938C108.098 22.3299 109.018 22.5502 110.283 22.7547C111.549 22.9436 112.584 23.1639 113.389 23.3999C114.194 23.6517 114.885 24.0609 115.476 24.6431C116.051 25.2253 116.347 26.0594 116.347 27.1294C116.347 28.5457 115.706 29.6787 114.425 30.5284C113.143 31.3782 111.401 31.8031 109.199 31.8031C107.884 31.8346 106.635 31.6772 105.403 31.3625Z"
        fill="#FF8228"
      />
      <path
        d="M125.419 25.1622L122.675 27.6486V31.6456H118.977V10.6377H122.675V23.3211L130.316 16.523H134.753L128.163 22.8647L135.377 31.6456H130.891L125.419 25.1622Z"
        fill="#FF8228"
      />
      <path
        d="M151.071 25.2095H138.68C138.894 26.3268 139.469 27.208 140.373 27.8532C141.293 28.4984 142.427 28.8288 143.791 28.8288C145.533 28.8288 146.963 28.2781 148.08 27.1923L150.069 29.3796C149.362 30.1979 148.458 30.8116 147.374 31.2207C146.289 31.6299 145.073 31.8502 143.709 31.8502C141.967 31.8502 140.439 31.5197 139.124 30.8588C137.809 30.1979 136.791 29.2852 136.068 28.105C135.344 26.9247 134.983 25.5872 134.983 24.0922C134.983 22.613 135.328 21.2912 136.035 20.1109C136.741 18.9307 137.711 18.018 138.943 17.3571C140.192 16.6962 141.589 16.3657 143.134 16.3657C144.679 16.3657 146.043 16.6962 147.259 17.3414C148.475 17.9866 149.411 18.915 150.102 20.0952C150.775 21.2754 151.12 22.6445 151.12 24.1866C151.137 24.4069 151.104 24.7689 151.071 25.2095ZM140.143 20.1896C139.321 20.8663 138.828 21.7475 138.648 22.8648H147.604C147.439 21.7633 146.963 20.882 146.158 20.2054C145.352 19.5287 144.35 19.1825 143.134 19.1825C141.967 19.1825 140.965 19.513 140.143 20.1896Z"
        fill="#FF8228"
      />
      <path
        d="M168.951 25.2095H156.56C156.773 26.3268 157.349 27.208 158.252 27.8532C159.173 28.4984 160.307 28.8288 161.671 28.8288C163.412 28.8288 164.842 28.2781 165.96 27.1923L167.948 29.3796C167.241 30.1979 166.338 30.8116 165.253 31.2207C164.168 31.6299 162.952 31.8502 161.588 31.8502C159.846 31.8502 158.318 31.5197 157.004 30.8588C155.689 30.1979 154.67 29.2852 153.947 28.105C153.224 26.9247 152.862 25.5872 152.862 24.0922C152.862 22.613 153.207 21.2912 153.914 20.1109C154.621 18.9307 155.59 18.018 156.823 17.3571C158.072 16.6962 159.468 16.3657 161.013 16.3657C162.558 16.3657 163.922 16.6962 165.138 17.3414C166.354 17.9866 167.291 18.915 167.981 20.0952C168.655 21.2754 169 22.6445 169 24.1866C169 24.4069 168.983 24.7689 168.951 25.2095ZM158.022 20.1896C157.201 20.8663 156.708 21.7475 156.527 22.8648H165.483C165.319 21.7633 164.842 20.882 164.037 20.2054C163.232 19.5287 162.229 19.1825 161.013 19.1825C159.846 19.1825 158.844 19.513 158.022 20.1896Z"
        fill="#FF8228"
      />
      <path
        d="M34.2141 42H9.62991C4.32196 42 0 37.8614 0 32.7628V9.22143C0 4.13863 4.32196 0 9.62991 0H34.2141C39.5385 0 43.844 4.13863 43.844 9.22143V32.7628C43.8605 37.8614 39.5385 42 34.2141 42Z"
        fill="#FF8228"
      />
      <path
        d="M15.2502 16.4754L15.546 16.318C14.3135 14.2251 10.5503 13.9733 7.14856 15.7515C6.93493 15.8144 6.68843 15.9403 6.49123 16.1134C6.0311 16.5068 5.85033 17.0419 6.09683 17.2936C6.34333 17.5454 6.9185 17.4195 7.37863 17.0261C7.83876 16.6327 8.0031 16.0977 7.77303 15.8459C7.77303 15.8459 7.7566 15.8302 7.74016 15.8302C10.8625 14.3667 14.1656 14.6342 15.2502 16.4754Z"
        fill="white"
      />
      <path
        d="M9.13698 12.3369C9.74501 12.1953 10.1723 11.8176 10.0901 11.4872V11.4714C13.574 11.6445 16.3348 13.407 16.3019 15.5314H16.647C16.6799 13.1395 13.5411 11.1724 9.64641 11.141C9.41635 11.078 9.13698 11.078 8.84118 11.141C8.23315 11.2826 7.80588 11.6603 7.88805 11.9907C7.97022 12.3054 8.52895 12.4628 9.13698 12.3369Z"
        fill="white"
      />
      <path
        d="M28.8407 10.6848C26.6879 11.2198 24.4037 15.2168 22.596 18.8204C22.5796 17.6874 22.0866 16.6331 21.1335 16.0036C19.3915 14.8234 16.7622 15.4843 15.2832 17.4514C13.7878 19.4184 14.0014 21.9834 15.7433 23.1479C16.7786 23.8403 18.1097 23.9032 19.3422 23.4311C19.1286 23.8875 18.9971 24.391 18.9478 24.8946C18.9643 24.8946 18.9643 24.8946 18.9807 24.8946C20.5912 25.1621 22.3988 24.6743 23.7792 23.4311C24.5351 22.7545 25.0774 21.9204 25.3568 21.0707C25.6362 21.0707 25.9648 21.0549 26.3757 20.992C27.7232 20.7717 30.5004 19.5128 31.3385 19.0407C33.2941 17.9392 31.355 16.5544 32.7682 14.3198C34.165 12.101 31.355 10.0711 28.8407 10.6848ZM18.7999 17.9706C19.2929 17.4041 20.0982 17.2468 20.6076 17.6402C21.117 18.0336 21.1334 18.8047 20.6405 19.3869C20.1475 19.9534 19.3422 20.1108 18.8328 19.7174C18.3234 19.324 18.3234 18.5529 18.7999 17.9706ZM31.2235 15.9564C31.5193 17.4041 30.9113 18.8204 26.2442 20.095C24.5023 20.4098 23.8614 20.1422 23.1219 20.4412C22.3824 20.7402 22.3002 20.7874 22.3002 20.7874C22.3002 20.7874 22.2838 20.8032 22.2509 20.8189C22.218 20.8346 22.1852 20.8346 22.1523 20.8504C22.3166 20.4884 22.4481 20.1265 22.5138 19.7646C24.2722 16.8848 29.0543 9.01673 31.092 12.3056C31.7165 13.5016 30.9277 14.5087 31.2235 15.9564Z"
        fill="white"
      />
      <path
        d="M18.8164 26.6256C18.8495 26.6098 18.8991 26.5941 18.9321 26.5783C18.9321 26.5626 18.9156 26.5626 18.9156 26.5469C18.8825 26.5783 18.8495 26.5941 18.8164 26.6256Z"
        fill="white"
      />
      <path
        d="M26.4413 27.3182C27.9532 25.9649 28.5448 24.0923 28.1504 22.4557C27.756 22.0466 27.3123 21.6846 26.8522 21.4014C26.8357 22.7547 26.2277 24.1709 25.0281 25.241C23.2697 26.8146 20.8212 27.1923 18.9478 26.3111C19.0135 26.7832 19.145 27.2552 19.3257 27.7116C21.1991 29.3639 24.3214 29.2065 26.4413 27.3182Z"
        fill="white"
      />
      <path
        d="M29.5639 24.8315C29.5639 26.4209 28.7258 28.1047 27.1482 29.3006C25.4391 30.6067 23.3028 31.0002 21.5938 30.4809C23.2535 31.6139 25.3898 31.8814 27.1646 30.9844H27.1811L28.7094 30.8743L28.7915 29.6626C29.8104 28.3722 30.1062 26.5625 29.5639 24.8315Z"
        fill="white"
      />
    </svg>
  );
};