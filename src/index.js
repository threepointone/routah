import React, {Component, PropTypes} from 'react';
import Matcher from 'route-parser';

export class Router extends Component{
  state = {
    location: null
  };
  static propTypes = {
    history: PropTypes.object.isRequired
  };
  static childContextTypes = {
    routah: PropTypes.object
  };
  getChildContext(){
    return {
      routah: {
        history: this.props.history
      }
    }
  }
  render(){
    return this.props.children;
  }
}



function matches(patterns, url){
  if(!Array.isArray(patterns)){
    patterns = [patterns];
  }

  for(let pattern of patterns){
    var matcher = new Matcher(pattern);
    let res = matcher.match(url)
    if(res){
      return res;
    }
  }
  return false;
}

export class Route extends Component{
  static propTypes = {
    match: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    component: PropTypes.func,
    notFound: PropTypes.func
  };
  static defaultProps = {
    notFound: () => <noscript/>
  };
  static contextTypes = {
    routah: PropTypes.object
  };
  componentWillMount(){
    this.dispose = this.context.routah.history.listen(location => {
      let doesMatch = true, match;
      if(this.props.path){
        match = matches(this.props.path, this.context.routah.history.createHref(location));
        doesMatch = !!match;
      }

      this.setState({
        location: {
          ...location,
          params: match || {}
        },
        matches: doesMatch
      })
    });
  }
  render(){
    let {location} = this.state;
    if(this.state.matches){
      if(this.props.component){
        return React.createElement(this.props.component, {location});
      }
      return this.props.children(location);
    }
    return this.props.notFound(location);
  }
  componentWillUnmount(){
    this.dispose();
    delete this.dispose();
  }
}


export class Link extends Component{
  static contextTypes = {
    routah: PropTypes.object
  };

  onClick = e => {
    e.preventDefault();
    this.context.routah.history.push(this.props.to);
  };
  render(){
    return <a href={this.context.routah.history.createHref(this.props.to)} {...this.props} onClick={this.onClick}>
      {this.props.children}
    </a>;
  }
}
