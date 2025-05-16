
const colorName = 'oklch';
const suffix = 'l c h';
export default {
  alpha(cssVar:string, a: number|string){
    return `${colorName}(from var(--${cssVar}) ${suffix} / ${a})`
  },
  color(cssVar:string) {
    return `var(--${cssVar})`;
  },
  spacing: (factor: number) => `calc(${factor} * var(--spacing, .25rem))`

}