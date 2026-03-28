import {
  Badge,
  Box,
  Flex,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemButton,
  Text,
  ListItemAvatar,
} from "@funext/ui";
import type {
  SaleEntryTargetProps,
  SaleEntryUserProps,
  SaleTargetBranchProps,
  SaleTargetProps,
  SaleTargetSideProps,
  SaleTargetStatesProps,
} from "../types";
import { i18n } from "~/utils/i18n";
import { getProgressClass } from "../uitls/colors";
import StorefrontIcon from "@funext/icons/Storefront";
import PersonIcon from "@funext/icons/Person";
import ScheduleIcon from "@funext/icons/Schedule";
import LocalShippingIcon from "@funext/icons/LocalShipping";
import { Container } from "~/components/shared/container";
import { PortalTitle } from "~/components/app/portal-title";
import { PercentageProgress } from "~/components/shared/circular-progress";
import { useRecord } from "~/context";

export const SaleTargetStateBox = () => {
  const data = useRecord() as SaleTargetStatesProps;
  //console.log("SaleTargetStateBox: data:", data)
  return (
    <>
      <h1 className="text-xl font-semibold text-primary md:text-display-xs">
        {data.title}
      </h1>
      <SaleTargetTopCard target={data} />
      <SaleTargetState target={data} />
      <SaleTargetSide
        target={data.company}
        title={i18n.get("Companies Sales")}
      />
      <SaleTargetSide
        target={data.individual}
        title={i18n.get("Individual Sales")}
      />
    </>
  );
};

export const SaleTargetBranchBox = () => {
  const data = useRecord() as SaleTargetBranchProps;
  return (
    <>
      <PortalTitle title={data.title}>
        <h1 className="text-xl font-semibold text-primary md:text-display-xs pb-4">
          {data.title}
        </h1>
      </PortalTitle>
      <SaleTargetTopCard target={data} />
      <SaleTargetBranch target={data} />
      <SaleTargetSide
        target={data.company}
        title={i18n.get("Companies Sales")}
      />
      <SaleTargetSide
        target={data.individual}
        title={i18n.get("Individual Sales")}
      />
    </>
  );
};

const SaleTargetTopCard = ({ target }: { target: SaleTargetProps }) => {
  return (
    <Card>
      <CardHeader title={i18n.get("Summery")} />
      <CardBody>
        <Line title={i18n.get("Total Target")} value={target.target} />
        <Line title={i18n.get("Total Sales")} value={target.balance} />
        <Line title={i18n.get("Total Shipments")} value={target.count} />
        <Line
          title={i18n.get("Progress")}
          value={
            <PercentageProgress value={target.percent} variant="determinate">
              <Text
                variant="caption"
                component="div"
                sx={{ color: "text.secondary" }}
              >{`${Math.round(target.percent)}%`}</Text>
            </PercentageProgress>
          }
        />
      </CardBody>
      <CardFooter divider>
        <h3 className="flex items-center gap-2 text-md font-semibold text-primary">
          <ScheduleIcon/>
          <span className="rounded-xs outline-focus-ring focus:outline-2 focus:outline-offset-2">
            
            {target.date_format}
          </span>
        </h3>
      </CardFooter>
    </Card>
  );
};

const SaleTargetState = ({ target }: { target: SaleTargetStatesProps }) => {
  const to = target.type === "states" ? `states` : `branches`;
  return (
    <Card>
      <CardHeader title={i18n.get("Details")} />
      <Box>
        <Divider />
        <List>
          {target.items.map((item, index) => (
            <SaleEntryItem item={item} key={index} to={to} />
          ))}
        </List>
      </Box>
      <CardFooter>
        {target.count} {i18n.get(to === "states" ? "Regions" : "Branches")}
      </CardFooter>
    </Card>
  );
};

const SaleTargetBranch = ({ target }: { target: SaleTargetBranchProps }) => {
  return (
    <Card>
      <CardHeader title={i18n.get("Details")} />
      <Box>
        <Divider />
        <List ul={false} divider className="border-0 border-secondary">
          {target.items.map((item, index) => (
            <SaleUserItem user={item} key={index} />
          ))}
        </List>
      </Box>
    </Card>
  );
};

const SaleEntryItem = ({
  item,
  to,
}: {
  item: SaleEntryTargetProps;
  to: string;
}) => {
  return (
    <ListItemButton
      href={`${to}/${item.id}`}
      divider
      className="border-b-1 border-secondary"
    >
      <Flex gap={4} flexGrow={1} items="center">
        <div className="text-primary-500 ring-primary-200 ring-2 rounded-full p-1 flex justify-center items-center">
          <StorefrontIcon size="lg" className="" />
        </div>

        <div className="flex flex-col justify-start grow gap-2">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <p className="text-md text-brand-secondary">
            {item.count} &nbsp; {i18n.get("Waybills")}
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <LineBadge percent={item.percent} />
          <span className="text-sm font-medium text-green-500">
            {item.balance}
          </span>
        </div>
      </Flex>
    </ListItemButton>
  );
};

const SaleUserItem = ({ user }: { user: SaleEntryUserProps }) => {
  return (
    <ListItem li={false} divider>
      <Flex gap={4} flexGrow={1} items="center">
        <div className="text-primary border-2 border-primary rounded-full p-1 flex justify-center items-center">
          <PersonIcon size="md" className="" />
        </div>
        <div className="flex flex-col justify-between grow gap-4">
          <h5>{user.title}</h5>
          <IconLabel icons={<LocalShippingIcon size="inherit"/>}  label={user.count}/>
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="text-sm font-medium text-green-500">
            {user.balance}
          </span>
          
        </div>
      </Flex>
    </ListItem>
  );
};

const VerticalSpacer = () => <div style={{ height: ".5em" }} />;

const SaleTargetSide = ({
  target,
  title,
}: {
  target: SaleTargetSideProps;
  title: React.ReactNode;
}) => {
  return (
    <Card>
      <CardHeader title={title} />
      <CardBody>
        <Line
          title={i18n.get("Out City Sales")}
          value={target.outside.balance}
        />
        <Line title={i18n.get("Count")} value={target.outside.count} />
        <Line title={i18n.get("In City Sales")} value={target.inside.balance} />
        <Line title={i18n.get("Count")} value={target.inside.count} />
        <VerticalSpacer />
        <Divider />
        <VerticalSpacer />
        <Line title={i18n.get("Total Sales")} value={target.balance} />
        <Line title={i18n.get("Count")} value={target.count} />
      </CardBody>
    </Card>
  );
};

const Line = ({
  title,
  value,
}: {
  title: React.ReactNode;
  value: React.ReactNode;
}) => {
  return (
    <div className="flex justify-between py-1 text-sm font-medium text-tertiary">
      <div>{title}:</div>
      <div className="ms-auto">{value}</div>
    </div>
  );
};

const LineBadge = ({ percent }: { percent: number }) => {
  const cclass = getProgressClass(percent);
  return (
    <span
      style={{ minWidth: "60px" }}
      className={`size-max min-w-12 flex items-center justify-center whitespace-nowrap rounded-full ring-1 ring-inset gap-1.5 py-0.5 pl-2 pr-2.5 text-sm font-medium ${cclass}`}
    >
      {percent}%
    </span>
  );
};

const IconLabel = ({icons, label}: {icons:React.ReactNode, label:React.ReactNode})=> {
    return <div className="flex gap-1 text-muted-fg text-sm items-center">
      {icons} {label}
    </div>
}
