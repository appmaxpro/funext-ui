import * as React from "react";
import { useState } from "react";
import { Box } from "../box";
import {
  Input,
  Button,
  IconButton,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineBody,
  //DialogTitle,
} from "../../mui";
import { MaterialIcon } from "../../icons/material-icon";

const config = {
  component: Dialog,
  title: "Components/Dialog",
};

export function DialogDefault() {
  const [open, setOpen] = React.useState(false);
 
  const handleOpen = () => setOpen(!open);
 
  return (
    <>
      <Button onClick={handleOpen} variant="gradient">
        Open Dialog
      </Button>
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>Its a simple dialog.</DialogHeader>
        <DialogBody>
          The key to more success is to have a lot of pillows. Put it this way,
          it took me twenty five years to get these plants, twenty five years of
          blood sweat and tears, and I&apos;m never giving up, I&apos;m just
          getting started. I&apos;m up to something. Fan luv.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleOpen}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button variant="gradient" color="green" onClick={handleOpen}>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export function DialogCustomAnimation() {
  const [open, setOpen] = React.useState(false);
 
  const handleOpen = () => setOpen(!open);
 
  return (
    <>
      <Button onClick={handleOpen} variant="gradient">
        Open Dialog
      </Button>
      <Dialog
        open={open}
        handler={handleOpen}
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
      >
        <DialogHeader>Its a simple dialog.</DialogHeader>
        <DialogBody>
          The key to more success is to have a lot of pillows. Put it this way,
          it took me twenty five years to get these plants, twenty five years of
          blood sweat and tears, and I&apos;m never giving up, I&apos;m just
          getting started. I&apos;m up to something. Fan luv.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleOpen}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button variant="gradient" color="green" onClick={handleOpen}>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export function DialogSizes() {
  const [size, setSize] = React.useState(null);
 
  const handleOpen = (value) => setSize(value);
 
  return (
    <>
      <div className="mb-3 flex gap-3">
        <Button onClick={() => handleOpen("xs")} variant="gradient">
          Open Dialog XS
        </Button>
        <Button onClick={() => handleOpen("sm")} variant="gradient">
          Open Dialog SM
        </Button>
        <Button onClick={() => handleOpen("md")} variant="gradient">
          Open Dialog MD
        </Button>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => handleOpen("lg")} variant="gradient">
          Open Dialog LG
        </Button>
        <Button onClick={() => handleOpen("xl")} variant="gradient">
          Open Dialog XL
        </Button>
        <Button onClick={() => handleOpen("xxl")} variant="gradient">
          Open Dialog XXL
        </Button>
      </div>
      <Dialog
        open={
          size === "xs" ||
          size === "sm" ||
          size === "md" ||
          size === "lg" ||
          size === "xl" ||
          size === "xxl"
        }
        size={size || "md"}
        handler={handleOpen}
      >
        <DialogHeader>Its a simple dialog.</DialogHeader>
        <DialogBody>
          The key to more success is to have a lot of pillows. Put it this way,
          it took me twenty five years to get these plants, twenty five years of
          blood sweat and tears, and I&apos;m never giving up, I&apos;m just
          getting started. I&apos;m up to something. Fan luv.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => handleOpen(null)}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={() => handleOpen(null)}
          >
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}


export function DialogWithForm() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen((cur) => !cur);
 
  return (
    <>
      <Button onClick={handleOpen}>Sign In</Button>
      <Dialog
        size="xs"
        open={open}
        handler={handleOpen}
        className="bg-transparent shadow-none"
      >
        <Card className="mx-auto w-full max-w-[24rem]">
          <CardBody className="flex flex-col gap-4">
            <Text variant="h4" color="slate">
              Sign In
            </Text>
            <Text
              className="mb-3 font-normal"
              variant="paragraph"
              color="gray"
            >
              Enter your email and password to Sign In.
            </Text>
            <Text className="-mb-2" variant="h6">
              Your Email
            </Text>
            <Input label="Email" size="lg" />
            <Text className="-mb-2" variant="h6">
              Your Password
            </Text>
            <Input label="Password" size="lg" />
            <div className="-ml-2.5 -mt-3">
              <Checkbox label="Remember Me" />
            </div>
          </CardBody>
          <CardFooter className="pt-0">
            <Button variant="gradient" onClick={handleOpen} fullWidth>
              Sign In
            </Button>
            <Text variant="small" className="mt-4 flex justify-center">
              Don&apos;t have an account?
              <Text
                as="a"
                href="#signup"
                variant="small"
                color="slate"
                className="ml-1 font-bold"
                onClick={handleOpen}
              >
                Sign up
              </Text>
            </Text>
          </CardFooter>
        </Card>
      </Dialog>
    </>
  );
}

export function SelectCategoriesDialog() {
  const [open, setOpen] = React.useState(false);
  const [checked, setChecked] = React.useState({});
  const handleOpen = () => setOpen(!open);
  const handleChecked = (name, value) => setChecked({...checked, [name]: value});

  return (
    <>
      <Button onClick={handleOpen} variant="gradient">
        Select Categories Dialog
      </Button>
      <Dialog size="sm" open={open} handler={handleOpen} className="p-4">
        <DialogHeader className="relative m-0 block">
          <Text variant="h4" color="slate">
            Select Categories
          </Text>
          <Text className="mt-1 font-normal text-gray-600">
            Categories help you organize your contacts based on their interests
            and interactions.
          </Text>
          <IconButton
            size="sm"
            variant="text"
            className="!absolute right-3.5 top-3.5"
            onClick={handleOpen}
          >
            <MaterialIcon className="h-4 w-4 stroke-2" icon="close"/>
          </IconButton>
        </DialogHeader>
        <DialogBody className="space-y-4 px-2">
          <Checkbox
            label={
              <div>
                <Text color="slate" className="text-base font-medium">
                  Updates
                </Text>
                <Text
                  variant="small"
                  color="gray"
                  className="font-normal"
                >
                  Receive the latest news and updates.
                </Text>
              </div>
            }
            containerProps={{
              className: "-mt-5",
            }}
          />
          <Checkbox
            label={
              <div>
                <Text color="slate" className="font-medium">
                  Leads
                </Text>
                <Text
                  variant="small"
                  color="gray"
                  className="font-normal"
                >
                  Potential clients and interested parties.
                </Text>
              </div>
            }
            containerProps={{
              className: "-mt-5",
            }}
          />
          <Checkbox
            checked={checked['3']}
            onChange={(e)=> handleChecked("3", e.currentTarget.checked)}
            label={
              <div>
                <Text color="slate" className="font-medium">
                  Webinars
                </Text>
                <Text
                  variant="small"
                  color="gray"
                  className="font-normal"
                >
                  Interested in attending webinars and online events.
                </Text>
              </div>
            }
            containerProps={{
              className: "-mt-5",
            }}
          />
        </DialogBody>
        <DialogFooter divider>
          <Button className="ml-auto" onClick={handleOpen}>
            save categories
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export function DeliveryMethodDialog() {
  const [open, setOpen] = React.useState(false);
 
  const handleOpen = () => setOpen(!open);
 
  return (
    <>
      <Button onClick={handleOpen} variant="gradient">
        Delivery Method Dialog
      </Button>
      <Dialog size="sm" open={open} handler={handleOpen} className="p-4">
        <DialogHeader className="relative m-0" onClose={handleOpen}>
          <Text variant="h4" color="slate">
            Delivery Method
          </Text>
        </DialogHeader>
        <DialogBody>
          <Text className="mb-3 font-normal text-gray-600">
            Please select your preferred delivery method for your order.
          </Text>
          <div className="space-y-4">
            <div>
              <input
                type="radio"
                id="standard"
                name="hosting"
                value="standard"
                className="peer hidden"
                required
              />
              <label
                htmlFor="standard"
                className="block w-full cursor-pointer rounded-lg border border-gray-300 p-4 text-gray-900 ring-1 ring-transparent peer-checked:border-primary peer-checked:ring-primary"
              >
                <div className="block">
                  <Text className="font-semibold">
                    Express Delivery
                  </Text>
                  <Text className="font-normal text-gray-600">
                    5-7 business days.{" "}
                    <strong className="text-gray-900">Free</strong>
                  </Text>
                </div>
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="express"
                name="hosting"
                defaultChecked
                value="express"
                className="peer hidden"
                required
              />
              <label
                htmlFor="express"
                className="block w-full cursor-pointer rounded-lg border border-gray-300 p-4 text-gray-900 ring-1 ring-transparent peer-checked:border-primary peer-checked:ring-primary"
              >
                <div className="block">
                  <Text className="font-semibold">
                    Express Delivery
                  </Text>
                  <Text className="font-normal text-gray-600">
                    2-3 business days.{" "}
                    <strong className="text-gray-900">$10.00</strong>
                  </Text>
                </div>
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="store"
                name="hosting"
                value="store"
                className="peer hidden"
                required
              />
              <label
                htmlFor="store"
                className="block w-full cursor-pointer rounded-lg border border-gray-300 p-4 text-gray-900 ring-1 ring-transparent peer-checked:border-primary peer-checked:ring-primary"
              >
                <div className="block">
                  <Text className="font-semibold">
                    Pickup In-Store
                  </Text>
                  <Text className="font-normal text-gray-600">
                    Available for pickup within 24 hours.{" "}
                    <strong className="text-gray-900">Free</strong>
                  </Text>
                </div>
              </label>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button className="ml-auto" onClick={handleOpen}>
            confirm delivery method
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
export function OrderDetailsDialog() {
  const [open, setOpen] = React.useState(false);
 
  const handleOpen = () => setOpen(!open);
 
  return (
    <>
      <Button onClick={handleOpen} variant="gradient">
        Order Details Dialog
      </Button>
      <Dialog size="sm" open={open} handler={handleOpen} >
        <DialogHeader className="relative m-0 p-6" onClose={handleOpen}>
          <Text variant="h4" color="slate">
            Delivery Method
          </Text>
          
        </DialogHeader>
        
        <DialogBody className="mx-4 -mt-4">
          <Text className="mb-2 font-normal text-gray-600">
            Please select your preferred delivery method for your order.
          </Text>
          <Timeline>
            <TimelineItem>
              <TimelineConnector />
              <TimelineHeader>
                <TimelineIcon className="p-2">
                  <MaterialIcon className="h-4 w-4" icon="home"/>
                </TimelineIcon>
                <Text color="slate" className="font-semibold">
                  $2,400, Design Changes
                </Text>
              </TimelineHeader>
              <TimelineBody className="-mt-2 pb-8">
                <Text color="gray" className="font-normal text-gray-600">
                  22 Dec 6:20 PM
                </Text>
              </TimelineBody>
            </TimelineItem>
            <TimelineItem>
              <TimelineConnector />
              <TimelineHeader>
                <TimelineIcon className="p-2">
                  <MaterialIcon className="h-4 w-4" icon="notifications"/>
                </TimelineIcon>
                <Text color="slate" className="font-semibold">
                  New order #1832412
                </Text>
              </TimelineHeader>
              <TimelineBody className="-mt-2 pb-8">
                <Text color="gray" className="font-normal text-gray-600">
                  21 Dec 8:20 PM
                </Text>
              </TimelineBody>
            </TimelineItem>
            <TimelineItem>
              <TimelineConnector />
              <TimelineHeader>
                <TimelineIcon className="p-2">
                  <MaterialIcon className="h-4 w-4" icon="currency_exchange" />
                </TimelineIcon>
                <Text color="slate" className="font-semibold">
                  Payment Completed
                </Text>
              </TimelineHeader>
              <TimelineBody className="-mt-2">
                <Text color="gray" className="font-normal text-gray-600">
                  17 Dec 4:20 PM
                </Text>
              </TimelineBody>
            </TimelineItem>
          </Timeline>
        </DialogBody>
        <DialogFooter>
          <Button className="mr-auto" onClick={handleOpen}>
            more details
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default config;
