import { useState } from "react";

import { Box } from "../Box";
import { 
  Switch as MuiSwitch, 
  Checkbox as MuiCheckbox,
  Radio as  MuiRadio
} from "../..";
import React from "react";
const config = {
  component: MuiSwitch,
  title: "Components/Switch",
};

export const Basic = () => {
  const [checked, setChecked] = useState(false);

  return (
     <Box d="flex" flexDirection="column" gap="10" ps={10}>
         <MuiSwitch
            checked={checked}
            onChange={(e: any) => setChecked(e.target.checked)}
          />
          <MuiSwitch
            checked={checked}
            label="Hello Nabil"
            onChange={(e: any) => setChecked(e.target.checked)}
          />
          <MuiSwitch
            checked={checked}
            color="green"
            label="Hello green"
            onChange={(e: any) => setChecked(e.target.checked)}
          />
          <MuiCheckbox 
            indeterminate
            label="Indeterminate"/>
          
          <MuiCheckbox 
            checked={checked}
            color="green"
            label="Hello green"
            onChange={(e: any) => setChecked(e.target.checked)}/>
          
          <MuiRadio 
            checked={checked}
            label="Checked"
            onChange={(e: any) => setChecked(e.target.checked)}/>

          <MuiRadio 
            label="Un Checked"/>
     </Box>
  );
};

export const Disabled = () => {
  return <MuiSwitch checked={true} disabled />;
};

export const Invalid = () => {
  const [checked, setChecked] = useState(false);

  return (
    <MuiSwitch
      checked={checked}
      onChange={(e: any) => setChecked(e.target.checked)}
      error
    />
  );
};

export const Readonly = () => {
  const [checked, setChecked] = useState(true);

  return (
    <MuiSwitch
      readOnly
      checked={checked}
      onChange={(e: any) => setChecked(e.target.checked)}
    />
  );
};

export const Sizes = () => {
  const [checked, setChecked] = useState(false);

  const handleChange = (e: any) => setChecked(e.target.checked);

  return (
    <Box>
      <MuiSwitch checked={checked} onChange={handleChange} size="sm" />
      <MuiSwitch checked={checked} onChange={handleChange} />
      <MuiSwitch checked={checked} onChange={handleChange} size="lg" />
    </Box>
  );
};

export default config;
