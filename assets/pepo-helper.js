(function () {
  var REPLY = "We answer every custom journal request.";
  var PHOTO_YES = "Great! After you send this, just reply to our email with your photos.";
  var FORM_URL = "https://formsubmit.co/mr.pepo.au@gmail.com";
  var script = document.currentScript;
  var assetBase = script && script.src ? script.src.replace(/pepo-helper\.js.*$/, "") : "assets/";

  var launch = document.createElement("button");
  launch.type = "button";
  launch.className = "pepo-helper-launch";
  launch.setAttribute("aria-expanded", "false");
  launch.setAttribute("aria-controls", "pepo-helper-panel");
  var label = document.createElement("span");
  label.className = "pepo-helper-label";
  label.textContent = "Ask Mr. Pepo";
  var face = document.createElement("span");
  face.className = "pepo-helper-face";
  var faceImg = document.createElement("img");
  faceImg.src = assetBase + "pepo-helper-face.jpg";
  faceImg.alt = "Mr. Pepo";
  face.appendChild(faceImg);
  launch.appendChild(label);
  launch.appendChild(face);

  var panel = document.createElement("section");
  panel.id = "pepo-helper-panel";
  panel.className = "pepo-helper-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", "pepo-helper-title");
  panel.hidden = true;

  var head = document.createElement("div");
  head.className = "pepo-helper-head";
  var title = document.createElement("h2");
  title.id = "pepo-helper-title";
  title.textContent = "Ask Mr. Pepo";
  var closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "pepo-helper-close";
  closeBtn.textContent = "Close";
  head.appendChild(title);
  head.appendChild(closeBtn);

  var body = document.createElement("div");
  body.className = "pepo-helper-body";
  panel.appendChild(head);
  panel.appendChild(body);
  document.body.appendChild(launch);
  document.body.appendChild(panel);

  var mode = "home";
  var answerId = "";
  var step = "who";
  var stack = [];
  var covers = null;
  var answers = blankAnswers();

  function blankAnswers() {
    return { who: "", type: "", typeOther: "", cover: "", pictures: "", words: "", name: "", email: "" };
  }

  function pageHash(id) {
    if (document.getElementById(id)) return "#" + id;
    return "index.html#" + id;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function p(className, text) {
    var el = document.createElement("p");
    if (className) el.className = className;
    el.textContent = text;
    return el;
  }

  function btn(text, onClick) {
    var el = document.createElement("button");
    el.type = "button";
    el.textContent = text;
    el.addEventListener("click", onClick);
    return el;
  }

  function link(href, text) {
    var el = document.createElement("a");
    el.href = href;
    el.textContent = text;
    if (href.indexOf("http") === 0) {
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    }
    return el;
  }

  function soonLine() {
    return p("pepo-helper-soon", REPLY);
  }

  function backButton() {
    return btn("Back", function () {
      if (!stack.length) {
        mode = "home";
        render();
        return;
      }
      step = stack.pop();
      render();
    });
  }

  function go(next) {
    stack.push(step);
    step = next;
    render();
  }

  function openPanel() {
    panel.hidden = false;
    launch.setAttribute("aria-expanded", "true");
    closeBtn.focus();
  }

  function closePanel() {
    panel.hidden = true;
    launch.setAttribute("aria-expanded", "false");
    launch.focus();
  }

  function readCovers(root) {
    return Array.prototype.map.call(root.querySelectorAll("#pepo-choose [data-pepo]"), function (button) {
      var span = button.querySelector("span");
      return {
        id: button.getAttribute("data-pepo"),
        src: button.getAttribute("data-src"),
        label: span ? span.textContent : ""
      };
    });
  }

  function ensureCovers(done) {
    if (covers) {
      done(covers);
      return;
    }
    var local = readCovers(document);
    if (local.length) {
      covers = local;
      done(covers);
      return;
    }
    fetch("index.html").then(function (res) { return res.text(); }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      covers = readCovers(doc);
      done(covers);
    }).catch(function () {
      covers = [];
      done(covers);
    });
  }

  function journalTypeValue() {
    if (answers.type === "Something else") return answers.typeOther || "Something else";
    return answers.type;
  }

  function postForm(subject, fields, flag) {
    var form = document.createElement("form");
    form.method = "POST";
    form.action = FORM_URL;
    function hidden(name, value) {
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }
    hidden("_subject", subject);
    hidden("_template", "table");
    hidden("_captcha", "true");
    var back = new URL(location.href);
    back.searchParams.set("helper", flag);
    back.hash = "pepo-helper";
    hidden("_next", back.toString());
    var honey = document.createElement("input");
    honey.type = "text";
    honey.name = "_honey";
    honey.className = "pepo-helper-honey";
    honey.tabIndex = -1;
    honey.autocomplete = "off";
    honey.setAttribute("aria-hidden", "true");
    form.appendChild(honey);
    Object.keys(fields).forEach(function (key) {
      hidden(key, fields[key]);
    });
    document.body.appendChild(form);
    form.submit();
  }

  function renderHome() {
    body.appendChild(p("pepo-helper-greet", "Hi! I'm Mr. Pepo's helper. What are you looking for?"));
    var actions = document.createElement("div");
    actions.className = "pepo-helper-actions";
    var items = [
      ["Free journals", "free"],
      ["Choose a Mr. Pepo cover", "cover"],
      ["Add my own pictures", "photos"],
      ["Make me a custom journal", "custom"],
      ["Support Pepo Studios", "support"],
      ["Stay in touch", "list"],
      ["Ask Peter something", "ask"]
    ];
    items.forEach(function (item) {
      actions.appendChild(btn(item[0], function () { chooseHome(item[1]); }));
      if (item[1] === "custom") actions.appendChild(soonLine());
    });
    body.appendChild(actions);
    var ask = document.createElement("form");
    ask.className = "pepo-helper-ask";
    var input = document.createElement("input");
    input.type = "text";
    input.setAttribute("aria-label", "Type a question");
    input.placeholder = "Type a question";
    var send = document.createElement("button");
    send.type = "submit";
    send.textContent = "Send";
    ask.appendChild(input);
    ask.appendChild(send);
    ask.addEventListener("submit", function (event) {
      event.preventDefault();
      matchQuestion(input.value);
    });
    body.appendChild(ask);
  }

  function chooseHome(id) {
    if (id === "custom") {
      mode = "flow";
      step = "who";
      stack = [];
      answers = blankAnswers();
      render();
      return;
    }
    if (id === "list" || id === "ask") {
      mode = id;
      render();
      return;
    }
    mode = "answer";
    answerId = id;
    render();
  }

  function renderAnswer() {
    var text = "";
    var links = [];
    if (answerId === "free" || answerId === "who" || answerId === "download") {
      text = "Free journals for kids, teens, parents and every neurodivergent mind.";
      links = [
        [pageHash("journals"), "Journals and diaries"],
        ["https://payhip.com/PepoStudios", "Pepo Studios shop"]
      ];
    } else if (answerId === "cover") {
      text = "Pick the Mr. Pepo you like best for your cover.";
      links = [[pageHash("pepo-choose"), "Choose your Mr. Pepo"]];
    } else if (answerId === "photos") {
      text = "You can personalise your journal with your own photos.";
      links = [[pageHash("journal-idea"), "Open the request form"]];
    } else if (answerId === "support" || answerId === "price") {
      text = "Free for everyone, or support what it's worth.";
      links = [["https://payhip.com/PepoStudios", "Pepo Studios shop"]];
    } else {
      text = "Leave a message for Peter.";
    }
    body.appendChild(p("pepo-helper-bubble", text));
    if (links.length) {
      var row = document.createElement("div");
      row.className = "pepo-helper-links";
      links.forEach(function (item) { row.appendChild(link(item[0], item[1])); });
      body.appendChild(row);
    }
    if (answerId === "fallback") {
      var ask = btn("Ask Peter something", function () { mode = "ask"; render(); });
      body.appendChild(ask);
    }
    var back = btn("Back", function () { mode = "home"; render(); });
    back.className = "pepo-helper-back";
    body.appendChild(back);
  }

  function choiceGroup(question, options, onPick) {
    var q = p("pepo-helper-bubble", question);
    q.id = "pepo-helper-qtext";
    body.appendChild(q);
    var group = document.createElement("div");
    group.className = "pepo-helper-choices";
    group.setAttribute("role", "group");
    group.setAttribute("aria-labelledby", "pepo-helper-qtext");
    options.forEach(function (option) {
      group.appendChild(btn(option, function () { onPick(option); }));
    });
    body.appendChild(group);
  }

  function renderFlow() {
    if (step === "who") {
      choiceGroup("Who is it for?", ["Kids", "Teens", "Adults", "Parents", "Teachers"], function (value) {
        answers.who = value;
        go("type");
      });
    } else if (step === "type") {
      choiceGroup("What kind of journal?", ["Gratitude", "Sleep & routine", "School", "Feelings & calm", "Something else"], function (value) {
        answers.type = value;
        go(value === "Something else" ? "typeOther" : "cover");
      });
    } else if (step === "typeOther") {
      body.appendChild(p("pepo-helper-bubble", "Tell us the kind of journal."));
      var field = document.createElement("label");
      field.className = "pepo-helper-field";
      field.textContent = "Your words";
      var input = document.createElement("input");
      input.type = "text";
      input.value = answers.typeOther;
      field.appendChild(input);
      body.appendChild(field);
      body.appendChild(btn("Next", function () {
        answers.typeOther = input.value.trim();
        if (!answers.typeOther) {
          input.focus();
          return;
        }
        go("cover");
      }));
      input.focus();
    } else if (step === "cover") {
      var q = p("pepo-helper-bubble", "Pick your Mr. Pepo cover.");
      q.id = "pepo-helper-qtext";
      body.appendChild(q);
      var list = document.createElement("div");
      list.className = "pepo-helper-covers";
      list.setAttribute("role", "group");
      list.setAttribute("aria-labelledby", "pepo-helper-qtext");
      ensureCovers(function (items) {
        if (step !== "cover") return;
        items.forEach(function (item) {
          var choice = document.createElement("button");
          choice.type = "button";
          var img = document.createElement("img");
          img.src = item.src;
          img.alt = "";
          var name = document.createElement("span");
          name.textContent = item.label;
          choice.appendChild(img);
          choice.appendChild(name);
          choice.addEventListener("click", function () {
            answers.cover = item.label;
            go("pictures");
          });
          list.appendChild(choice);
        });
        var surprise = document.createElement("button");
        surprise.type = "button";
        surprise.textContent = "Surprise me";
        surprise.addEventListener("click", function () {
          answers.cover = "Surprise me";
          go("pictures");
        });
        list.appendChild(surprise);
      });
      body.appendChild(list);
    } else if (step === "pictures") {
      choiceGroup("Add your own pictures?", ["Yes", "No"], function (value) {
        answers.pictures = value;
        go("words");
      });
    } else if (step === "words") {
      if (answers.pictures === "Yes") body.appendChild(p("pepo-helper-bubble", PHOTO_YES));
      body.appendChild(p("pepo-helper-bubble", "Any name or words for the cover?"));
      var words = document.createElement("label");
      words.className = "pepo-helper-field";
      words.appendChild(document.createTextNode("Optional"));
      var wordsInput = document.createElement("input");
      wordsInput.type = "text";
      wordsInput.value = answers.words;
      wordsInput.placeholder = "A name or a few words";
      words.appendChild(wordsInput);
      body.appendChild(words);
      body.appendChild(btn("Next", function () {
        answers.words = wordsInput.value.trim();
        go("contact");
      }));
    } else if (step === "contact") {
      body.appendChild(p("pepo-helper-bubble", "Your name and email."));
      var nameField = document.createElement("label");
      nameField.className = "pepo-helper-field";
      nameField.appendChild(document.createTextNode("Name"));
      var nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.autocomplete = "name";
      nameInput.required = true;
      nameInput.value = answers.name;
      nameField.appendChild(nameInput);
      var emailField = document.createElement("label");
      emailField.className = "pepo-helper-field";
      emailField.appendChild(document.createTextNode("Email"));
      var emailInput = document.createElement("input");
      emailInput.type = "email";
      emailInput.autocomplete = "email";
      emailInput.required = true;
      emailInput.value = answers.email;
      emailField.appendChild(emailInput);
      body.appendChild(nameField);
      body.appendChild(emailField);
      body.appendChild(btn("Next", function () {
        answers.name = nameInput.value.trim();
        answers.email = emailInput.value.trim();
        if (!answers.name || !answers.email) {
          (answers.name ? emailInput : nameInput).focus();
          return;
        }
        go("summary");
      }));
    } else if (step === "summary") {
      body.appendChild(p("pepo-helper-bubble", "Here is your journal."));
      var list = document.createElement("ul");
      list.className = "pepo-helper-summary";
      [
        ["Who it is for", answers.who],
        ["Journal type", journalTypeValue()],
        ["Cover", answers.cover],
        ["Own pictures", answers.pictures],
        ["Cover words", answers.words || "None"],
        ["Name", answers.name],
        ["Email", answers.email]
      ].forEach(function (row) {
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(row[0] + ": " + row[1]));
        list.appendChild(li);
      });
      body.appendChild(list);
      body.appendChild(soonLine());
      var row = document.createElement("div");
      row.className = "pepo-helper-row";
      var edit = btn("Edit", function () {
        stack = [];
        step = "who";
        render();
      });
      edit.className = "pepo-helper-edit";
      var send = btn("Send", function () {
        postForm("Pepo Studios custom journal request", {
          "Who it is for": answers.who,
          "Journal type": journalTypeValue(),
          "Cover": answers.cover,
          "Own pictures": answers.pictures,
          "Cover words": answers.words || "None",
          "name": answers.name,
          "email": answers.email
        }, "journal");
      });
      send.className = "pepo-helper-send";
      row.appendChild(edit);
      row.appendChild(send);
      body.appendChild(row);
    }
    if (step !== "who" || stack.length) {
      var back = backButton();
      back.className = "pepo-helper-back";
      body.appendChild(back);
    } else {
      var home = btn("Back", function () { mode = "home"; render(); });
      home.className = "pepo-helper-back";
      body.appendChild(home);
    }
  }

  function renderMini(kind) {
    var form = document.createElement("form");
    if (kind === "list") {
      body.appendChild(p("pepo-helper-bubble", "Leave your email and we will stay in touch."));
      var email = document.createElement("input");
      email.type = "email";
      email.required = true;
      email.autocomplete = "email";
      email.setAttribute("aria-label", "Email");
      email.placeholder = "your@email.com";
      form.appendChild(email);
      var join = document.createElement("button");
      join.type = "submit";
      join.className = "pepo-helper-send";
      join.textContent = "Join";
      form.appendChild(join);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        postForm("Pepo Studios list signup", { email: email.value.trim() }, "list");
      });
    } else {
      body.appendChild(p("pepo-helper-bubble", "Leave a message for Peter."));
      ["Name", "Email", "Message"].forEach(function (name) {
        var field = document.createElement("label");
        field.className = "pepo-helper-field";
        field.appendChild(document.createTextNode(name));
        var input = name === "Message" ? document.createElement("textarea") : document.createElement("input");
        if (name !== "Message") input.type = name === "Email" ? "email" : "text";
        input.required = true;
        if (name === "Email") input.autocomplete = "email";
        if (name === "Name") input.autocomplete = "name";
        field.appendChild(input);
        form.appendChild(field);
      });
      var send = document.createElement("button");
      send.type = "submit";
      send.className = "pepo-helper-send";
      send.textContent = "Send to Peter";
      form.appendChild(send);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var fields = form.querySelectorAll("input, textarea");
        postForm("Pepo Studios question for Peter", {
          name: fields[0].value.trim(),
          email: fields[1].value.trim(),
          message: fields[2].value.trim()
        }, "note");
      });
    }
    body.appendChild(form);
    var back = btn("Back", function () { mode = "home"; render(); });
    back.className = "pepo-helper-back";
    body.appendChild(back);
  }

  function renderThanks(text) {
    body.appendChild(p("pepo-helper-bubble", text));
    body.appendChild(soonLine());
  }

  function render() {
    clear(body);
    if (mode === "home") renderHome();
    else if (mode === "answer") renderAnswer();
    else if (mode === "flow") renderFlow();
    else if (mode === "list") renderMini("list");
    else if (mode === "ask") renderMini("ask");
    else if (mode === "thanks-journal") renderThanks("Thanks! We have your journal idea.");
    else if (mode === "thanks-list") renderThanks("Thanks! You're on the list.");
    else if (mode === "thanks-note") renderThanks("Thanks! Peter will read your message.");
    body.scrollTop = 0;
  }

  function matchQuestion(raw) {
    var text = (raw || "").toLowerCase();
    var rules = [
      ["custom", "custom"],
      ["photo", "photos"],
      ["cover", "cover"],
      ["who", "who"],
      ["download", "download"],
      ["price", "price"],
      ["free", "free"]
    ];
    var found = "";
    rules.forEach(function (rule) {
      if (!found && text.indexOf(rule[0]) !== -1) found = rule[1];
    });
    if (!found) {
      mode = "answer";
      answerId = "fallback";
      render();
      return;
    }
    chooseHome(found === "who" || found === "download" ? found : found);
    if (found === "who" || found === "download" || found === "price") {
      mode = "answer";
      answerId = found;
      render();
    }
  }

  launch.addEventListener("click", function () {
    if (panel.hidden) {
      if (mode === "home" && !body.childNodes.length) render();
      openPanel();
    } else {
      closePanel();
    }
  });
  closeBtn.addEventListener("click", closePanel);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !panel.hidden) {
      event.preventDefault();
      closePanel();
    }
  });

  var flag = new URLSearchParams(location.search).get("helper");
  if (flag === "journal" || flag === "list" || flag === "note") {
    mode = flag === "journal" ? "thanks-journal" : flag === "list" ? "thanks-list" : "thanks-note";
    render();
    openPanel();
  } else {
    render();
  }
})();
