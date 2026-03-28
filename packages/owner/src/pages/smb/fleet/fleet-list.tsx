import React from "react";
import VirtualList, {
  createVirtualItemRef,
  type VirtualListItemProps,
} from "~/components/shared/virtual-list";
import List from "@funext/ui/List";
import { useViewDataContext } from "~/context";

const Item = React.memo<VirtualListItemProps>(({ model, i, data }) => (
  <List.Item ref={createVirtualItemRef(model, i)} gutters={false}>
    <List.ItemButton li={false}>
      <List.Text primary={`row ${i}`} />
    </List.ItemButton>
  </List.Item>
));


const TruckList = () => {

  const { dataStore } = useViewDataContext();

  //return <VirtualList Item={Item} itemData={[]} withLayoutScroller/>
}

export default TruckList;