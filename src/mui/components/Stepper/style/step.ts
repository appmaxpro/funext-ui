export interface StepStyleTypes {
  styles?: {
    base?: {
      initial?: object;
      active?: object;
      completed?: object;
    };
  };
}

export const step: StepStyleTypes = {
  styles: {
    base: {
      initial: {
        position: "relative",
        zIndex: "z-10",
        display: "grid",
        placeItems: "place-items-center",
        width: "w-10",
        height: "h-10",
        borderRadius: "rounded-full",
        backgroundColor: "bg-primary-300",
        color: "text-slate-900",
        fontWeight: "font-bold",
        transition: "transition-all duration-300",
      },
      active: {
        backgroundColor: "bg-primary",
        color: "text-white",
      },
      completed: {
        backgroundColor: "bg-primary",
        color: "text-white",
      },
    },
  },
};

export default step;
