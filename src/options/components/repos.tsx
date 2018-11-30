import * as React from "react";
import { BaseSection, CustomButton } from "./base";

const RepoList = ({ repos }) => {
  return (
    <ul>
      {repos.map(repo => (
        <li key={repo}>{repo}</li>
      ))}
    </ul>
  );
};

export class ReposSection extends React.Component<
  { data?: IGitInfo; onClearAll: any },
  { isExpanded: boolean }
> {
  state = {
    isExpanded: false
  };

  toggleExpanded() {
    this.setState({ isExpanded: !this.state.isExpanded });
  }

  renderClearButton() {
    return (
      <CustomButton onClick={this.props.onClearAll}>Delete all</CustomButton>
    );
  }

  renderShowButton() {
    const n = this.props.data ? this.props.data.repos.length : 0;
    const text = this.state.isExpanded ? `Hide repos` : `Show ${n} repos`;
    return (
      <CustomButton onClick={() => this.toggleExpanded()}>{text}</CustomButton>
    );
  }

  render() {
    const { data } = this.props;
    return (
      <BaseSection title={"Repositories on disk"}>
        <div>
          <strong>Location</strong> {data ? data.location : ""}
        </div>
        <div>
          <strong>Size</strong> {data ? data.size : ""}
        </div>
        <div className="py-2">
          {this.renderShowButton()}
          {this.renderClearButton()}
        </div>
        {this.state.isExpanded ? (
          <RepoList repos={data ? data.repos : []} />
        ) : null}
      </BaseSection>
    );
  }
}
