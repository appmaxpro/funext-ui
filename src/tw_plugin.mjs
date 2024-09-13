console.log("---------Tw plugin loadeding----------");
module.exports = function ({ addVariant }) {
  console.log("-------------------");
  console.log("Tw plugin loaded");
  addVariant('inverted', '@media (inverted-colors: inverted)');
  addVariant('hocus', ['&:focus', '&:hover']);
  
}