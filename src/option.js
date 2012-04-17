AugmentedGesture.Options	= function(){
	this.general	= {
		video	: {
			w		: 320/4,
			h		: 240/4,
			frameRate	: 1
		}
	};
	this.right	= {
		pointer	: {
			display		: true,
			coordSmoothV	: 0.3,
			coordSmoothH	: 0.3
		},
		disp	: {
			enable	: false,
			VHist	: false,
			HHist	: true,
			VLine	: false,
			HLine	: false
		},
		colorFilter	: {
			r	: {
				min	: 125,
				max	: 255
			},
			g	: {
				min	:   3,
				max	: 140
			},
			b	: {
				min	:  10,
				max	:  90
			}
		},
		smooth	: {
			vWidth	: 9,
			hWidth	: 9
		}
	};
	this.left	= {
		pointer	: {
			display		: false,
			coordSmoothV	: 0.3,
			coordSmoothH	: 0.3
		},
		disp	: {
			enable	: false,
			VHist	: false,
			HHist	: false,
			VLine	: false,
			HLine	: false
		},
		colorFilter	: {
			r	: {
				min	:   0,
				max	:  80
			},
			g	: {
				min	:  70,
				max	: 255
			},
			b	: {
				min	:   0,
				max	: 113
			}
		},
		smooth	: {
			vWidth	: 9,
			hWidth	: 9
		}
	};
};
