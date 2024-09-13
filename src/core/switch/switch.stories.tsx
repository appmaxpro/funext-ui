import { useState } from "react";

import { Box } from "../box";
import { Switch } from "./switch";
import { 
  Switch as MuiSwitch, 
  Checkbox as MuiCheckbox,
  Radio as  MuiRadio

} from "../../mui";
const config = {
  component: Switch,
  title: "Components/Switch",
};

export const Basic = () => {
  const [checked, setChecked] = useState(false);

  return (
     <Box d="flex" flexDirection="column" gap="10px">
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
  return <Switch checked={true} disabled />;
};

export const Invalid = () => {
  const [checked, setChecked] = useState(false);

  return (
    <Switch
      invalid
      checked={checked}
      onChange={(e: any) => setChecked(e.target.checked)}
    />
  );
};

export const Readonly = () => {
  const [checked, setChecked] = useState(true);

  return (
    <Switch
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
      <Switch checked={checked} onChange={handleChange} size="sm" />
      <Switch checked={checked} onChange={handleChange} />
      <Switch checked={checked} onChange={handleChange} size="lg" />
    </Box>
  );
};

export default config;
