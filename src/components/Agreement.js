import React, {Component} from "react";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
// import {tomorrow} from "react-syntax-highlighter/dist/cjs/styles/prism";
import code from "../icon/code.png";

class Agreement extends Component {
    constructor(props) {


        super(props);
        this.state = {

        }

        this.components = {
            code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                    <SyntaxHighlighter wrapLongLines={false} language={match[1]} PreTag="div"
                                       children={String(children).replace(/\n$/, '')} {...props} />
                ) : (
                    <code className={className} {...props}>
                        {children}
                    </code>
                )
            }
        }
    }


    render() {
        return (
            <div>
                <div className="content-wall-views">
                    <div className="wrapper-about">
                        <div className="about-text">

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


export default Agreement;
