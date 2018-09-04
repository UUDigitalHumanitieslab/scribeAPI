const DoneButton = require("./done-button.jsx");
const createReactClass = require("create-react-class");

const TextField = createReactClass({
  displayName: "TextField",

  render() {
    return (
      <span>
        <div className="left">
          <div className="input-field active">
            <label>{this.props.instruction}</label>
            <input
              ref="input0"
              type="text"
              data-task_key={this.props.key}
              onChange={this.props.handleChange}
              value={this.props.val}
            />
          </div>
        </div>
        <div className="right">
          <DoneButton onClick={this.props.commitAnnotation} />
        </div>
      </span>
    );
  }
});

module.exports = TextField;
