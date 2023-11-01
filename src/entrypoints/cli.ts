import { input, password, select } from "@inquirer/prompts";
import chalk from "chalk";
import gradient from "gradient-string";
import { ApiClient } from "../services/ApiClient";

const api = new ApiClient();

const displayHelpText = () => {
  const userEmail = api.getUserEmail();
  const status = userEmail
    ? `logged in as ${gradient.passion(userEmail)}`
    : chalk.yellow("logged out");

  console.log(`
    ${gradient.retro("Welcome to the Coin Tracker CLI Demo")}

      Usage:
        my-cli [command]
  
      Commands:
        help              Display this help text
        register          Register with email + password
        login             Login with email + password
        logout            Logout
        address           Add, remove, or fetch BTC addresses 
        transactions      View BTC address transactions
        
      Status: (${status})
    `);
};

const register = async () => {
  const email = await input({ message: "Enter your email:" });
  const pass = await password({ message: "Enter your password:" });

  const user = await api.register(email, pass);

  if (!user) console.log(user);
};

const login = async () => {
  const email = await input({ message: "Enter your email:" });
  const pass = await password({ message: "Enter your password:" });

  const user = await api.login(email, pass);

  if (!user) console.log(user);
};

const handleAddressFlow = async () => {
  const command = await select({
    message: "Select a command",
    choices: [
      {
        name: "Add",
        value: "add",
        description: "Add a new BTC Address",
      },
      {
        name: "Remove",
        value: "remove",
        description: "Remove existing BTC Address",
      },
      {
        name: "Fetch",
        value: "fetch",
        description: "Fetch BTC Address with stats",
      },
    ],
  });

  if (command === "add") {
    const btcAddress = await input({ message: "Enter BTC address:" });
    const res = await api.addAddress(btcAddress);

    if (res.error) {
      console.log(chalk.red(res.errMessage));
    } else {
      console.log(chalk.green("Successfully added BTC address"));
    }
  } else if (command === "remove") {
    const addressIdToDelete = await input({
      message: "What is the id of the address you wish to remove?",
    });
    const res = await api.removeAddress(parseInt(addressIdToDelete));

    if (res.error) {
      console.log(chalk.red("Address with that ID does not exist"));
    } else {
      console.log(chalk.green("Successfully removed BTC address"));
    }
  } else if (command === "fetch") {
    const addresses = await api.getAllAddresses();

    addresses.map((address) => {
      console.log(`
        ${chalk.magenta("ID")}: ${address.id}
        ${chalk.magenta("Address")}: ${address.address}
        ${chalk.magenta("Total Balance")}: ${
          address.balance
        } (${chalk.greenBright(address.balanceUSD)})
        ${chalk.magenta("Total Received")}: ${
          address.received
        } (${chalk.greenBright(address.receivedUSD)})
        ${chalk.magenta("Total Sent")}: ${address.sent} (${chalk.greenBright(
          address.sentUSD,
        )})
        ${chalk.magenta("Total Transactions")}: ${address.transactions}
      `);
    });
  }
};

(async () => {
  const args = process.argv.slice(2);
  const argsSet = new Set(args);

  if (!args.length || argsSet.has("-h") || argsSet.has("--help")) {
    displayHelpText();
  }

  const [command] = args;

  switch (command) {
    case "help":
      displayHelpText();
      break;

    case "register":
      await register();
      break;

    case "login":
      await login();
      break;

    case "address":
      await handleAddressFlow();
      break;
    case "logout":
      api.logout();
      break;
    // Add other cases here for other commands
    default:
      console.log("Unknown command");
  }
})();
