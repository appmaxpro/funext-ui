import * as React from "react";
import { useState, useCallback } from "react";

import { Box } from "../Box";
import { Button } from "../Button";
import { ArrowNavigation } from "./ArrowNavigation";
import {styled} from "../../styles";
import emStyled from '@emotion/styled';

const config = {
  component: ArrowNavigation,
  title: "Core/ArrowNavigation",
};

const InBox = styled('div')('');

const CustomButton = (props) => <Button {...props}
    sx={{
          w: 75, 
          m: 1, 
          ['&:focus']:{
            border: '1px solid var(--tw-gray-200)!important'
          },
          ...props.sx
      }}/>;


const CustomButton5 = emStyled(Button)(
  {
    margin: 1,
    width: 75,
    ['&:focus']:{
      border: '1px solid var(--tw-gray-200)!important'
    }
  }
);

export const Basic = function () {
  const [box, setBox] = useState<HTMLElement | null>(null);

  const selector: any = useCallback(() => {
    if (box) {
      return [
        box.querySelectorAll("div:nth-child(1) > button"),
        box.querySelectorAll("div:nth-child(2) > button"),
        box.querySelectorAll("div:nth-child(3) > button"),
        box.querySelectorAll("div:nth-child(4) > button"),
      ];
    }
    return [];
  }, [box]);

  return (
    <ArrowNavigation selector={selector}>
      <Box ref={setBox} d="flex" flexDirection="column">
        <Box d="flex">
          <CustomButton>1</CustomButton>
          <CustomButton>2</CustomButton>
          <CustomButton>3</CustomButton>
          <CustomButton>.</CustomButton>
        </Box>
        <Box d="flex">
          <CustomButton>4</CustomButton>
          <CustomButton>5</CustomButton>
          <CustomButton>6</CustomButton>
          <CustomButton disabled>C</CustomButton>
          <CustomButton>DEL</CustomButton>
        </Box>
        <Box d="flex">
          <CustomButton>7</CustomButton>
          <CustomButton>8</CustomButton>
          <CustomButton>9</CustomButton>
          <CustomButton>=</CustomButton>
          <CustomButton>00</CustomButton>
        </Box>
        <Box d="flex">
          <CustomButton>0</CustomButton>
          <CustomButton style={{ visibility: "hidden" }}>0</CustomButton>
          <CustomButton style={{ visibility: "hidden" }}>0</CustomButton>
          <CustomButton>(</CustomButton>
          <CustomButton>)</CustomButton>
        </Box>
      </Box>
    </ArrowNavigation>
  );
};

export const Horizontal = function () {
  return (
    <ArrowNavigation selector={"auto-horizontal"}>
      <Box d="flex" flexDirection="row" flex>
        <CustomButton width={75}>Item 1</CustomButton>
        <CustomButton>Item 2</CustomButton>
        <CustomButton>Item 3</CustomButton>
        <CustomButton style={{ visibility: "hidden" }}>Item 4</CustomButton>
        <CustomButton>Item 5</CustomButton>
        <CustomButton>Item 6</CustomButton>
        <CustomButton style={{ display: "none" }}>Item 7</CustomButton>
      </Box>
    </ArrowNavigation>
  );
};

export const Vertical = function () {
  return (
    <ArrowNavigation selector={"auto-vertical"}>
      <Box d="flex" sx={{display: 'flex', w: 80, g: 4, c:"#000", h:.99, fd:"col"}} 
       fw={500}>
        <CustomButton>Item 1</CustomButton>
        <CustomButton>Item 2</CustomButton>
        <CustomButton disabled>Item 3</CustomButton>
        <CustomButton>Item 4</CustomButton>
        <CustomButton>Item 5</CustomButton>
        <CustomButton>Item 6</CustomButton>
      </Box>
    </ArrowNavigation>
  );
};

export default config;
