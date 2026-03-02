import React from "react";
import VirtualList, {
  RawVirtualList,
  createVirtualListItemRef,
  type VirtualListItemProps,
} from "~/components/other/virtual-list";
import List from "@funext/ui/List";
import { useViewContext } from "~/context";

const Item = React.memo<VirtualListItemProps>(({ model, i, data }) => (
  <List.Item ref={createVirtualListItemRef(model, i)} gutters={false}>
    <List.ItemButton li={false}>
      <List.ItemText primary={`row ${i}`} />
    </List.ItemButton>
  </List.Item>
));


const TruckList = () => {

  const { dataStore } = useViewContext();

  //React.useCallback(()=> )
  

  return <VirtualList Item={Item} itemData={[]} withLayoutScroller/>
}

export default TruckList;