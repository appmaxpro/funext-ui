import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Box } from "./box";
import { Card, Chip, SxBox, Text, styled } from "../../mui";

const meta = {
  title: "Layout/Box",
  component: Box,
} satisfies Meta<typeof Box>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    border: true,
    p: 4,
    children: "Welcome!",
  },
};

export const Border = () => {
  return (
    <Box display="flex">
      <Box p={5} m={2} border bg="body-tertiary">
        square
      </Box>
      <Box p={5} m={2} border rounded={2} borderWidth={2} bg="body-tertiary">
        rounded
      </Box>
      <Box p={5} m={2} border borderColor="primary" bg="body-tertiary">
        primary
      </Box>
      <Box p={5} m={2} borderTop bg="body-tertiary">
        top
      </Box>
      <Box p={5} m={2} borderEnd bg="body-tertiary">
        end
      </Box>
      <Box p={5} m={2} borderBottom bg="body-tertiary">
        bottom
      </Box>
      <Box p={5} m={2} borderStart bg="body-tertiary">
        start
      </Box>
    </Box>
  );
};

const colors: any = {
  primary: "white",
  "primary-subtle": "primary-emphasis",
  secondary: "white",
  "secondary-subtle": "secondary-emphasis",
  success: "white",
  "success-subtle": "success-emphasis",
  danger: "white",
  "danger-subtle": "danger-emphasis",
  warning: "dark",
  "warning-subtle": "warning-emphasis",
  info: "dark",
  "info-subtle": "info-emphasis",
  light: "dark",
  "light-subtle": "light-emphasis",
  dark: "white",
  "dark-subtle": "dark-emphasis",
  body: "body",
  "body-secondary": "body",
  "body-tertiary": "body",
  white: "dark",
  transparent: "body",
};

const gradientIgnore = [
  "body",
  "body-secondary",
  "body-tertiary",
  "white",
  "transparent",
];

export const Background = () => {
  return (
    <Box style={{ width: 400 }}>
      {(Object.keys(colors) as Array<any>).map((c) => (
        <Box key={c} p={3} m={2} bg={c} color={colors[c]}>
          {c}
        </Box>
      ))}
    </Box>
  );
};

export const Gradient = () => {
  return (
    <Box style={{ width: 400 }}>
      {(Object.keys(colors) as Array<any>)
        .filter((c) => gradientIgnore.indexOf(c) === -1)
        .map((c) => (
          <Box key={c} p={3} m={2} bg={c} color={colors[c]} bgGradient>
            {c} gradient
          </Box>
        ))}
    </Box>
  );
};

export const BoxShadow = () => {
  return (
    <Box style={{ width: 400 }} bg="body-tertiary" p={4}>
      <Box shadow={false} p={3} mb={5} bg="body" rounded={2}>
        No Shadow
      </Box>
      <Box shadow p={3} mb={5} bg="body" rounded={2}>
        Regular Shadow
      </Box>
      <Box shadow="sm" p={3} mb={5} bg="body" rounded={2}>
        Small Shadow
      </Box>
      <Box shadow="md" p={3} mb={5} bg="body" rounded={2}>
        Medium Shadow
      </Box>
      <Box shadow="lg" p={3} mb={5} bg="body" rounded={2}>
        Large Shadow
      </Box>
      <Box shadow="xl" p={3} mb={5} bg="body" rounded={2}>
        Larger Shadow
      </Box>
      <Box shadow="2xl" p={3} mb={5} bg="body" rounded={2}>
        2x Larger Shadow
      </Box>
      <Box shadow="inner" p={3} mb={5} bg="body" rounded={2}>
        Inner Shadow
      </Box>
    </Box>
  );
};

export const DropShadow = () => {
  return (
    <Box style={{ width: 400 }} bg="body-tertiary" p={4}>
      <Box dropShadow={false} p={3} mb={5} bg="body" rounded={2}>
        No Shadow
      </Box>
      <Box dropShadow p={3} mb={5} bg="body" rounded={2}>
        Regular Shadow
      </Box>
      <Box dropShadow="sm" p={3} mb={5} bg="body" rounded={2}>
        Small Shadow
      </Box>
      <Box dropShadow="md" p={3} mb={5} bg="body" rounded={2}>
        Medium Shadow
      </Box>
      <Box dropShadow="lg" p={3} mb={5} bg="body" rounded={2}>
        Large Shadow
      </Box>
      <Box dropShadow="xl" p={3} mb={5} bg="body" rounded={2}>
        Larger Shadow
      </Box>
      <Box dropShadow="2xl" p={3} mb={5} bg="body" rounded={2}>
        2x Larger Shadow
      </Box>
    </Box>
  );
};

export const Display = () => {
  return (
    <Box style={{ width: 400 }}>
      <Box mb={2}>
        <Box d="inline" p={1} bg="primary" color="white">
          inline
        </Box>
        <Box d="inline" p={1} bg="dark" color="white">
          inline
        </Box>
      </Box>
      <Box mb={2}>
        <Box d="block" p={1} bg="primary" color="white">
          block
        </Box>
        <Box d="block" p={1} bg="black" color="white">
          block
        </Box>
      </Box>
    </Box>
  );
};

export const Float = () => {
  return (
    <Box>
      <Box float="start">Float start on all viewport sizes</Box>
      <br />
      <Box float="end">Float end on all viewport sizes</Box>
      <br />
      <Box float="none">Don't float on all viewport sizes</Box>
    </Box>
  );
};

export const Link = () => {
  return (
    <Box d="flex" flexDirection="column">
      <Box as="a" href="#" p={1} mb={1} linkColor="primary">
        Primary Link
      </Box>
      <Box as="a" href="#" p={1} mb={1} linkColor="secondary">
        Secondary Link
      </Box>
      <Box as="a" href="#" p={1} mb={1} linkColor="success">
        Success Link
      </Box>
      <Box as="a" href="#" p={1} mb={1} linkColor="danger">
        Danger Link
      </Box>
      <Box as="a" href="#" p={1} mb={1} linkColor="warning">
        Warning Link
      </Box>
      <Box as="a" href="#" p={1} mb={1} linkColor="info">
        Info Link
      </Box>
      <Box as="a" href="#" p={1} mb={1} linkColor="light">
        Light Link
      </Box>
      <Box as="a" href="#" p={1} mb={1} linkColor="dark">
        Dark Link
      </Box>
      <Box as="a" href="#" p={1} mb={1} linkColor="body-emphasis">
        Emphasis link
      </Box>
    </Box>
  );
};

export const PointerEvents = () => {
  return (
    <Box>
      <Box as="p">
        <Box as="a" href="#" pointerEvents="none" aria-disabled="true">
          This link
        </Box>{" "}
        can not be clicked.
      </Box>
      <Box as="p">
        <Box as="a" href="#" pointerEvents="auto">
          This link
        </Box>{" "}
        can be clicked (this is default behavior).
      </Box>
      <Box as="p" pointerEvents="none">
        <Box as="a" href="#" aria-disabled="true">
          This link
        </Box>{" "}
        can not be clicked because the pointer-events property is inherited from
        its parent. However,"{" "}
        <Box as="a" href="#" pointerEvents="auto">
          This link
        </Box>{" "}
        has a pe-auto class and can be clicked.
      </Box>
    </Box>
  );
};

export const Opacity = () => {
  return (
    <Box d="flex" style={{ width: 400 }}>
      <Box
        opacity={100}
        p={3}
        m={2}
        bg="primary"
        color="light"
        fontWeight="bold"
        rounded
      >
        100%
      </Box>
      <Box
        opacity={75}
        p={3}
        m={2}
        bg="primary"
        color="light"
        fontWeight="bold"
        rounded
      >
        75%
      </Box>
      <Box
        opacity={50}
        p={3}
        m={2}
        bg="primary"
        color="light"
        fontWeight="bold"
        rounded
      >
        59%
      </Box>
      <Box
        opacity={25}
        p={3}
        m={2}
        bg="primary"
        color="light"
        fontWeight="bold"
        rounded
      >
        25%
      </Box>
      <Box
        opacity={0}
        p={3}
        m={2}
        bg="primary"
        color="light"
        fontWeight="bold"
        rounded
      >
        0%
      </Box>
    </Box>
  );
};

export const TextBox = () => {
  return (
    <Box style={{ width: 400 }}>
      <Box p={1} mb={1} color="primary">
        primary
      </Box>
      <Box p={1} mb={1} color="primary-emphasis">
        primary-emphasis
      </Box>
      <Box p={1} mb={1} color="secondary">
        secondary
      </Box>
      <Box p={1} mb={1} color="secondary-emphasis">
        secondary-emphasis
      </Box>
      <Box p={1} mb={1} color="success">
        success
      </Box>
      <Box p={1} mb={1} color="success-emphasis">
        success-emphasis
      </Box>
      <Box p={1} mb={1} color="danger">
        danger
      </Box>
      <Box p={1} mb={1} color="danger-emphasis">
        danger
      </Box>
      <Box p={1} mb={1} color="warning" bg="dark">
        warning
      </Box>
      <Box p={1} mb={1} color="warning-emphasis">
        warning-emphasis
      </Box>
      <Box p={1} mb={1} color="info" bg="dark">
        info
      </Box>
      <Box p={1} mb={1} color="info-emphasis">
        info-emphasis
      </Box>
      <Box p={1} mb={1} color="light" bg="dark">
        light
      </Box>
      <Box p={1} mb={1} color="light-emphasis">
        light-emphasis
      </Box>
      <Box p={1} mb={1} color="dark">
        dark
      </Box>
      <Box p={1} mb={1} color="dark-emphasis">
        dark-emphasis
      </Box>
      <Box p={1} mb={1} color="body">
        body
      </Box>
      <Box p={1} mb={1} color="body-emphasis">
        body-emphasis
      </Box>
      <Box p={1} mb={1} color="body-secondary">
        body-secondary
      </Box>
      <Box p={1} mb={1} color="body-tertiary">
        body-terniary
      </Box>
      <Box p={1} mb={1} color="white" bg="dark">
        white
      </Box>
      <Box p={1} mb={1} color="black">
        black
      </Box>
      <Box p={1} mb={1} color="black-50">
        black_50
      </Box>
      <Box p={1} mb={1} color="white-50" bg="dark">
        white_50
      </Box>
    </Box>
  );
};

export const TextAlign = () => {
  return (
    <Box>
      <Box as="p" textAlign="start">
        Start aligned text on all viewport sizes.
      </Box>
      <Box as="p" textAlign="center">
        Center aligned text on all viewport sizes.
      </Box>
      <Box as="p" textAlign="end">
        End aligned text on all viewport sizes.
      </Box>
      <Box as="p" textAlign={{ sm: "start" }}>
        Start aligned text on viewports sized SM (small) or wider.
      </Box>
      <Box as="p" textAlign={{ md: "start" }}>
        Start aligned text on viewports sized MD (medium) or wider.
      </Box>
      <Box as="p" textAlign={{ lg: "start" }}>
        Start aligned text on viewports sized LG (large) or wider.
      </Box>
      <Box as="p" textAlign={{ xl: "start" }}>
        Start aligned text on viewports sized XL (extra-large) or wider.
      </Box>
    </Box>
  );
};

export const FontSize = () => {
  return (
    <Box>
      <Box as="p" fontSize={1}>
        fontSize={`{1}`} text
      </Box>
      <Box as="p" fontSize={2}>
        fontSize={`{2}`} text
      </Box>
      <Box as="p" fontSize={3}>
        fontSize={`{3}`} text
      </Box>
      <Box as="p" fontSize={4}>
        fontSize={`{4}`} text
      </Box>
      <Box as="p" fontSize={5}>
        fontSize={`{5}`} text
      </Box>
      <Box as="p" fontSize={6}>
        fontSize={`{6}`} text
      </Box>
    </Box>
  );
};

export const FontWeight = () => {
  return (
    <Box>
      <Box as="p" fontWeight="bold">
        Bold text.
      </Box>
      <Box as="p" fontWeight="bolder">
        Bolder weight text (relative to the parent element).
      </Box>
      <Box as="p" fontWeight="normal">
        Normal weight text.
      </Box>
      <Box as="p" fontWeight="light">
        Light weight text.
      </Box>
      <Box as="p" fontWeight="lighter">
        Lighter weight text (relative to the parent element).
      </Box>
      <Box as="p" fontStyle="italic">
        Italic text.
      </Box>
      <Box as="p" fontStyle="normal">
        Text with normal font style
      </Box>
    </Box>
  );
};

export const Overflow = () => {
  return (
    <Box display="flex">
      <Box
        overflow="auto"
        p={3}
        mb={{
          base: 3,
          md: 0,
        }}
        me={{
          md: 3,
        }}
        bg="body-tertiary"
        style={{
          maxWidth: 260,
          maxHeight: 100,
        }}
      >
        This is an example of using <code>.overflow-auto</code> on an element
        with set width and height dimensions. By design, this content will
        vertically scroll.
      </Box>
      <Box
        overflow="hidden"
        p={3}
        mb={{
          base: 3,
          md: 0,
        }}
        me={{
          md: 3,
        }}
        bg="body-tertiary"
        style={{
          maxWidth: 260,
          maxHeight: 100,
        }}
      >
        This is an example of using <code>.overflow-hidden</code> on an element
        with set width and height dimensions.
      </Box>
      <Box
        overflow="visible"
        p={3}
        mb={{
          base: 3,
          md: 0,
        }}
        me={{
          md: 3,
        }}
        bg="body-tertiary"
        style={{
          maxWidth: 260,
          maxHeight: 100,
        }}
      >
        This is an example of using <code>.overflow-visible</code> on an element
        with set width and height dimensions.
      </Box>
      <Box
        overflow="scroll"
        p={3}
        bg="body-tertiary"
        style={{
          maxWidth: 260,
          maxHeight: 100,
        }}
      >
        This is an example of using <code>.overflow-scroll</code> on an element
        with set width and height dimensions.
      </Box>
    </Box>
  );
};

export const BoxContainer1 = () => {
  return (
    <ResizableDemo>
      <SxBox
        className="@container"
        width={400}
        maxWidth="min(80vw, 600px)"
        overflow="auto"
        justify="center"
        sx={{
          resize: "horizontal",
          containerType: "inline-size",
        }}
      >
        <Card
          variant="outlined"
          sx={{
            display: "flex",
            overflow: "auto",
            flexDirection: {
              "@": "column",
              "@350": "row",
            },
          }}
          className="@xs:flex-col @sm:flex-row flex-none"
        >
          <SxBox
            component="img"
            alt="The house from the offer."
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&w=350&dpr=2"
            sx={{
              alignSelf: "stretch",
              aspectRatio: "16 / 9",
              objectFit: "cover",
              maxHeight: {
                "@": 160,
                "@350": "initial",
              },
              maxWidth: {
                "@350": "36%",
                "@500": 240,
              },
              transition: "0.4s",
            }}
            className="w-full @xs:max-h-40 @sm:max-h-[initial] @sm:max-h-[36%] @lg:max-w-60"
          />
          <Card.Content
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              padding: {
                "@": 2,
                "@500": 3,
              },
              flex: "auto",
              transition: "padding 0.4s",
            }}
          >
            <div>
              <Text
                component="div"
                sx={{ color: "text.secondary", fontSize: "0.875rem" }}
              >
                123 Main St, Phoenix AZ
              </Text>
              <Text
                component="div"
                fw="bold"
                sx={{
                  color: "primary.main",
                  fontSize: "1.125rem",
                  //fontWeight: 'bold',
                }}
              >
                $280,000 — $310,000
              </Text>
            </div>
            <Chip
              size="sm"
              label="Confidence score: 85%"
              sx={{ py: 0, width: "fit-content" }}
              className="rounded-full"
              color="inherit"
              variant="filled"
            />
                  <SxBox
                    className="@container"
                    width={300}
                    maxWidth="min(90%, 400px)"
                    overflow="auto"
                    justify="center"
                    sx={{
                      resize: "horizontal",
                      containerType: "inline-size",
                    }}
                  >
                     <SxBox
                      component="img"
                      alt="The house from the offer."
                      src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&w=350&dpr=2"
                      sx={{
                        alignSelf: "stretch",
                        aspectRatio: "16 / 9",
                        objectFit: "cover",
                        maxHeight: {
                          "@": 160,
                          "@350": "initial",
                        },
                        maxWidth: {
                          "@350": "36%",
                          "@500": 240,
                        },
                        transition: "0.4s",
                      }}
                      className="w-full @xs:max-h-40 @sm:max-h-[initial] @sm:max-h-[36%] @lg:max-w-60"
                    />
                  </SxBox>
          </Card.Content>
        </Card>
      </SxBox>
    </ResizableDemo>
  );
};

const Line = styled("div")(({ theme }) => ({
  position: "absolute",
  height: "100vh",
  top: 0,
  transform: "translateY(-400px)",
  left: 0,
  borderLeft: "1px dashed",
  borderColor: (theme.vars || theme).palette.divider,
  color: (theme.vars || theme).palette.text.secondary,
  fontSize: "0.75rem",
  fontFamily: "Menlo, monospace",
  "& span": {
    position: "absolute",
    top: "calc(400px - 1em)",
    left: 4,
  },
}));

function ResizableDemo({ children }) {
  return (
    <SxBox
      sx={{
        position: "relative",
        paddingBlock: 2,
        ml: 2,
        mr: "auto",
        "*:has(> &)": {
          overflow: "hidden",
        },
      }}
    >
      <Line>
        <span>0px</span>
      </Line>
      <Line sx={{ left: 350 }}>
        <span>350px</span>
      </Line>
      <Line sx={{ left: 500 }}>
        <span>500px</span>
      </Line>
      {children}
    </SxBox>
  );
}
