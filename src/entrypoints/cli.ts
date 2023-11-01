import { input, password } from "@inquirer/prompts";
import chalk from "chalk";
import gradient from "gradient-string";
import { AuthService } from "../services/AuthService";

const auth = new AuthService();

const displayHelpText = () => {
  const userEmail = auth.getUserEmail();
  const status = userEmail
    ? `logged in as ${gradient.passion(userEmail)}`
    : chalk.yellow("logged out");

  console.log(`
    ${gradient.retro("Welcome to the Coin Tracker CLI Demo")}

      Usage:
        my-cli [command]
  
      Commands:
        help        Display this help text
        register    Register with email + password
        login       Login with email + password
        logout      Logout
        

      Status: (${status})
    `);
};

const register = async () => {
  const email = await input({ message: "Enter your email" });
  const pass = await password({ message: "Enter your password" });

  const user = await auth.register(email, pass);

  if (!user) console.log(user);
};

const login = async () => {
  const email = await input({ message: "Enter your email" });
  const pass = await password({ message: "Enter your password" });

  const user = await auth.login(email, pass);

  if (!user) console.log(user);
};

(async () => {
  const args = process.argv.slice(2);
  const argsSet = new Set(args);

  if (!args.length || argsSet.has("-h") || argsSet.has("--help")) {
    displayHelpText();
  }
  //   const command = await select({
  //     message: "Select a command",
  //     choices: [
  //       {
  //         name: "help",
  //         value: "help",
  //         description: "Description on available commands and options",
  //       },
  //     ],
  //   });

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

    case "logout":
      auth.logout();
      break;
    // Add other cases here for other commands
    default:
      console.log("Unknown command");
  }
})();
