require("dotenv").config();

const Discord = require("discord.js");
const departements = require("@etalab/decoupage-administratif/data/departements.json");

// console.log("departements", departements);
let isGameStarted = false;
let answerNumber = null;
const defaultQuestion = 15;
let questionTotal = defaultQuestion;
let canAnswer = false;
let score = {};

const { DISCORD_TOKEN } = process.env;

const client = new Discord.Client();

const onMessage = (message) => {
  if (message.author.bot === true) {
    return;
  }
  if (message.channel.name !== "games") {
    return;
  }

  if (isGameStarted === false) {
    if (message.content === "!start") {
      isGameStarted = true;
      goToNextQuestion(message);
    }
  } else {
    if (canAnswer === true) {
      const userMsg = message.content.trim();
      if (["1", "2", "3", "4"].includes(userMsg) === true) {
        if (userMsg === answerNumber) {
          // isGameStarted = false;
          canAnswer = false;
          addScore(message.author.username);
          questionTotal--;
          message.channel.send(`Bravo ${message.author}, tu as 1point`);

          if (questionTotal > 0) {
            goToNextQuestion(message);
          } else {
            endGame(message);
          }
        }
      }
    }
  }
};

const onReady = () => {
  console.log(`Logged in as ${client.user.tag}`);
};

const endGame = (message) => {
  questionTotal = defaultQuestion;
  isGameStarted = false;
  message.channel.send(
    "Le jeu est terminée. Tapez **!start** pour le redémarrer"
  );
  const fields = Object.entries(score)
    .sort((a, b) => b[1] - a[1])
    .map((u) => ({
      name: u[0],
      value: u[1],
      inline: false,
    }));
  message.channel.send({
    embed: {
      title: "Le résultat final",
      fields,
    },
  });
};

const addScore = (username) => {
  if (!score[username]) {
    //   if (typeof score[username] === 'undefined') {
    //   if (score.hasOwnProperty(username) === false) {
    score[username] = 0;
  }
  score[username] += 1;
};

const getPossibilities = (departements) => {
  const randIndex = Math.floor(Math.random() * (departements.length - 4));
  const selectedDpts = departements.slice(randIndex, randIndex + 4);

  //   console.log(
  //     "sortedDpts",
  //     selectedDpts.map((u) => u.nom)
  //   );

  selectedDpts.sort(() => Math.round(Math.random()) - 0.5);
  selectedDpts.sort(() => Math.round(Math.random()) - 0.5);
  selectedDpts.sort(() => Math.round(Math.random()) - 0.5);
  selectedDpts.sort(() => Math.round(Math.random()) - 0.5);
  //   console.log(
  //     "sortedDpts",
  //     sortedDpts.map((u) => u.nom)
  //   );
  //   console.log(
  //     "selectedDpts",
  //     selectedDpts.map((u) => u.nom)
  //   );

  //   const answer = selectedDpts[Math.floor(Math.random()) * 4];
  const answerIndex = Math.floor(Math.random() * 4);
  //   console.log("answerIndex");
  const answerUserIndex = (answerIndex + 1).toString();
  const answer = selectedDpts[answerIndex];

  const possibilities = selectedDpts.map((dpt) => dpt.nom);

  //   console.log("selectedDpts", answer);
  //   console.log("possibilities", possibilities);

  //   const answer = ;

  return {
    answer,
    answerUserIndex,
    possibilities,
  };
};

// getPossibilities(departements);

const getQuestionEmbed = ({ answer, possibilities }) => {
  const embed = {
    title: `A quel département correspond ce numéro ? **${answer.code}**`,
    fields: possibilities.map((dpt, index) => ({
      name: index + 1,
      value: dpt,
      inline: true,
    })),
  };
  return embed;
};

const goToNextQuestion = (message) => {
  message.channel.send(`Le jeu va démarrer dans 5 secondes`);
  const { possibilities, answer, answerUserIndex } = getPossibilities(
    departements
  );
  answerNumber = answerUserIndex;

  setTimeout(() => {
    canAnswer = true;
    const questionEmbed = getQuestionEmbed({ answer, possibilities });
    message.channel.send({ embed: questionEmbed });
  }, 5000);
};

// getPossibilities(departements);

client.on("ready", onReady);
client.on("message", onMessage);

client.login(DISCORD_TOKEN);
