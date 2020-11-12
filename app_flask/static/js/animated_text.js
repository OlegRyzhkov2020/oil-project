<script type="module">
import Tiper from "/static/tiper-js";
//ES5
//let Tiper = require('tiper-js');

let tiper = new Tiper(
  document.querySelector(".tiper-js-container"),
  {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus tempus sagittis dapibus. Fusce lacinia dui tortor, at porttitor quam luctus ut. Aliquam gravida commodo eros ac dictum. Nam ac odio at sem interdum dictum eget sit amet lorem. Vivamus enim velit, condimentum sed neque non, dignissim viverra nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Duis sodales, neque eget tincidunt efficitur, nisi orci vestibulum diam, eget fringilla dui dolor sed nisi. Pellentesque feugiat augue in felis interdum, non tempus dui volutpat. Sed pulvinar, massa non placerat scelerisque, nunc tellus posuere felis, a ultricies mi libero id velit. Mauris sed arcu dolor. Mauris varius a metus sit amet pulvinar. Proin rhoncus non quam in vulputate. ",
    hesitation: 0.45, // used as a factor in determining the delay between typing the next character
    wordsPerMinute: 40,
    pauseTimeout: 525,
    pauseOnSpace: false,
    pauseOnEndOfSentence: true,
    showCaret: false,
    caretType: "normal", // 'normal' or 'underscore'
    glitch: false, //  show glitch effect
    onFinishedTyping: function () {
      console.log("Finished typing!");
    },
  }
);
tiper.beginTyping();

tiper.line('More Text');

tiper.stopTyping();

</script>
