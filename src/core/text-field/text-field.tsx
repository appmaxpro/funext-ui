// @ts-nocheck
import { MaterialIcon, MaterialIconProps } from "../../icons/material-icon";
import { Input, type InputProps } from "../../mui";
import { InputFeedback } from "../input-feedback";
import { InputLabel } from "../input-label";
import { Stack } from "../stack";
import { withStyled } from "../styled";
import { useClassNames, useTheme } from "../styles";
import styles from "./text-field.module.scss";

export interface TextFieldProps extends InputProps {
  icons?: MaterialIconProps[];
  description?: string | JSX.Element;
}

export const TextField = withStyled(Input)<TextFieldProps>((
  {
    icons = [],
    description,
    required,
    disabled,
    invalid,
    readOnly,
    ...inputProps
  },
  ref,
) => {
  const classNames = useClassNames();
  return (
    <div
      className={classNames([styles.container], {
        [styles.disabled]: disabled,
        [styles.readonly]: readOnly
      },
      'mui_text_field'
    )}
    >
      <Input
        ref={ref}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        error={invalid}
        {...inputProps}
        className={classNames([
          styles.wrapper,
        ])}
        endAdornment={(icons.length > 0 ? (
          <>
            {icons.map((icon, index) => (
              <MaterialIcon key={index} {...icon} />
            ))}
          </>
        ) : null)}
      />
      {description && (
        <InputFeedback invalid={invalid}>{description}</InputFeedback>
      )}
    </div>
  );
});
