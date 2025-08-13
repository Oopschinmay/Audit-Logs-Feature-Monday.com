
import { Flex } from "@vibe/core";
import classes from "./app.module.scss";
import cx from "classnames";
import "@vibe/core/tokens";
import { useGetContext } from "./services/hooks";
import AuditLogView from "./components/auditlogs/AuditLogView";

function App() {
  const context = useGetContext();
  return (
    <Flex
      className={cx(context.theme + "-app-theme", classes.main)}
      direction="column"
      align="center"
      justify="start"
    >
      <AuditLogView />
    </Flex>
  );
}

export default App;
