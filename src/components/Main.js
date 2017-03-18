require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
//获取图片相关数据
let imageDatas = require('../data/imageDatas.json');
//利用自执行函数，将图片名信息转成图片URL路径信息
imageDatas = (function genImageURL (imageDatasArr) {
  for (var i = 0, j = imageDatasArr.length; i < j; i++) {
    let singleImageData = imageDatasArr[i];

    singleImageData.imageURL = require('../images/' + singleImageData.fileName);

    imageDatasArr[i] = singleImageData;
  }

  return imageDatasArr;
})(imageDatas);

class ImgFigure extends React.Component {
  render() {

    let styleObj = {};

    // 如果 props 属性中指定了这张图片的位置，则使用
    if (this.props.arrange.pos) {
      styleObj = this.props.arrange.pos;
    }

    return (
      <figure className="img-figure" style={styleObj}>
        <img src={this.props.data.imageURL} alt={this.props.data.title}/>
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
        </figcaption>
      </figure>
    );
  }
}

class AppComponent extends React.Component {
  Constant = {
    centerPos: {
      left: 0,
      right: 0
    }
  }
  hPosRange = {
    leftSecX: [0, 0],
    rightSecX: [0, 0],
    y: [0, 0]
  }
  vPosRange = {
    x: [0, 0],
    topY: [0, 0]
  }

  /**
   * 获取区间内的一个随机值
   */
  getRangeRandom (low, high) {
    return Math.ceil(Math.random() * (high - low) + low);
  }

  /**
   * 重新布局所有图片
   * @param centerIndex 指定居中排布哪张图片
   */
  rearrange(centerIndex) {
    let imgsArrangeArr = this.state.imgsArrangeArr,
        Constant = this.Constant,
        centerPos = Constant.centerPos,
        hPosRange = this.hPosRange,
        vPosRange = this.vPosRange,
        hPosRangeLeftSecX = hPosRange.leftSecX,
        hPosRangeRightSecX = hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,
        vPosRangeTopY = vPosRange.topY,
        vPosRangeX = vPosRange.x,
        imgsArrangeTopArr = [],
        // 取一个或不取
        topImgNum = Math.ceil(Math.random() * 2),
        topImgSpliceIndex = 0,
        imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);

        // 首先居中 centerIndex 的图片
        imgsArrangeCenterArr[0].pos = centerPos;

        // 取出要布局上侧的图片的状态信息
        topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));

        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);

        // 布局位于上侧的图片
        imgsArrangeTopArr.forEach(function (value, index){
          imgsArrangeTopArr[index].pos = {
            top: this.getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
            left: this.getRangeRandom(vPosRangeX[0], vPosRangeX[1])
          }
        }.bind(this))

        // 布局左右两侧的图片
        for (let i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {
          let hPosRangeLORX = null;

          // 前半部分布局左侧，有半部分布局右侧
          if (i < k) {
            hPosRangeLORX = hPosRangeLeftSecX;
          } else {
            hPosRangeLORX = hPosRangeRightSecX;
          }

          imgsArrangeArr[i].pos = {
            top: this.getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
            left: this.getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
          }

        }

        if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
          imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
        }

        imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);

        this.setState({
          imgsArrangeArr: imgsArrangeArr
        });
  }

  constructor (props) {
    super(props);
    this.state = {
      imgsArrangeArr: []
    }
  }

  /**
   * 组件加载后，为每张图片计算其位置的范围
   */
  componentDidMount() {

    //舞台的大小
    let stageDOM = this.stage,
        stageW = stageDOM.scrollWidth,
        stageH = stageDOM.scrollHeight,
        halfStageW = Math.ceil(stageW / 2),
        halfStageH = Math.ceil(stageH / 2);

    //获取一个imageFigure的大小
    let imgFigureDOM = this.imgFigure0,
        imgW = imgFigureDOM.scrollWidth,
        imgH = imgFigureDOM.scrollHeight,
        halfImgW = Math.ceil(imgW / 2),
        halfImgH = Math.ceil(imgH / 2);

    // 计算中心图片的位置点
    this.Constant.centerPos = {
      left: halfStageW - halfImgW,
      top: halfStageH - halfImgH
    }
    // 计算左侧，右侧区域图片排布位置的范围
    this.hPosRange.leftSecX[0] = -halfImgW;
    this.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
    this.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    this.hPosRange.rightSecX[1] = stageW - halfImgW;
    this.hPosRange.y[0] = -halfImgH;
    this.hPosRange.y[1] = stageH - halfImgH;
    // 计算上册区域图片排布位置的范围
    this.vPosRange.topY[0] = -halfImgH;
    this.vPosRange.topY[1] = halfStageH - halfImgH * 3;
    this.vPosRange.x[0] = halfStageW - imgW;
    this.vPosRange.x[1] = halfStageW;

    this.rearrange(0);
  }

  render() {
    let controllerUnits = [],
        imgFigures = [];

    for (let [index, value] of imageDatas.entries()) {
      if (!this.state.imgsArrangeArr[index]) {
        this.state.imgsArrangeArr[index] = {
          pos: {
            left: 0,
            top: 0
          }
        }
      }

      imgFigures.push(<ImgFigure key={'imgFigure' + index} data={value} ref={(ImgFigure) => {this['imgFigure' + index] = ImgFigure}} arrange={this.state.imgsArrangeArr[index]}/>)

    }


    return (
      <section className="stage" ref={(section) => {this.stage = section}}>
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
}

AppComponent.propTypes = {
  imgFigures: React.PropTypes.element.isRequired
}

AppComponent.defaultProps = {
  imgFigures: <h1>Imgage Nothing</h1>
};

export default AppComponent;
