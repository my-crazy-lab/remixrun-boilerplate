import FormData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
});

const account = {
  from: "Mailgun Sandbox <postmaster@sandbox56e4a22a00b34f6faa731c1db42f56da.mailgun.org>",
  to: ["leminh.nguyen@btaskee.com"],
  subject: "Hello",
  text: "Testing some Mailgun awesomness!",
};

mg.messages
  .create("sandbox56e4a22a00b34f6faa731c1db42f56da.mailgun.org", {
    from: "Excited User <mailgun@sandbox-123.mailgun.org>",
    to: ["leminh.nguyen@btaskee.com"],
    subject: "Hello",
    text: "Testing some Mailgun awesomness!",
    html: "<h1>Testing some Mailgun awesomness!</h1>",
  })
  .then((msg) => console.log(msg)) // logs response data
  .catch((err) => console.error(err)); // logs any error

console.log("setup mailgun");
