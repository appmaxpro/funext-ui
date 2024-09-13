export default function setRef(ref:any, value:any) {
  if (typeof ref=== 'function') {
    ref(value);
  } else {
    ref.current = value;
  }
}