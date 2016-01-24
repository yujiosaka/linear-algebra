(function (root, factory) {
  "use strict";

  // AMD
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  }
  // CommonJS
  else if (typeof exports === 'object') {
    module.exports = factory();
  }
  // Browser
  else {
    root.linearAlgebra = factory();
  }
})(this, function () {
  "use strict";


  var _throwError = function(msg) {
    throw new Error('linear-algebra: ' + msg);
  };


  var _throwSizeMismatchError = function(op, arg1, arg2) {
    _throwError('[' + op + '] op1 is ' + arg1.rows  + ' x ' + arg1.cols + 
      ' and op2 is ' + arg2.rows + ' x ' + arg2.cols);
  };


  /**
   * Initialise the linear algebra library.
   *
   * @param {Object} options Additional options.
   * @param {Function} [options.add] Function to add floating point numbers.
   * 
   * @return {Object} Linear algebra primitives.
   */
  return function(options) {
    options = options || {};

    
  var LinAlg = {};


  /**
   * Our common number array class.
   *
   * @param {Array} values 1D array (vector) or 2D array (matrix) with length >= 1.
   * 
   * @constructor
   */
  var Matrix = LinAlg.Matrix = function(values) {
    if (Array.isArray(values[0])) {
      // matrix
      this.data = values;
      this.rows = values.length;
      this.cols = values[0].length;
    } else {
      // row-vector
      this.data = [values];
      this.rows = 1;
      this.cols = values.length;
    }
  };




  /**
   * Clone this matrix.
   * @return {Matrix}
   */
  Matrix.prototype.clone = function() {
    return new Matrix(this.toArray());
  };




  /**
   * Get plain array version of this matrix.
   * 
   * @return {Array}
   */
  Matrix.prototype.toArray = function() {
    var thisData = this.data,
      rows = this.rows,
      cols = this.cols;

    var a = new Array(rows);

    for (var i = 0; i<rows; ++i) {
      a[i] = thisData[i].slice(0, cols);
    }

    return a;
  };




  /**
   * Create an identity matrix of given dimensions.
   * @param  {Integer} dim Length of one side.
   * @return {Matrix}
   */
  Matrix.identity = function(dim) {
    return Matrix.scalar(dim, 1);
  };




  /**
   * Create a scalar diagonal matrix.
   * @param {Integer} dim Matrix size (length of each side)
   * @param  {Number} entry The value to place in each diagonal.
   * @return {Matrix}
   */
  Matrix.scalar = function(dim, entry) {
    var a = new Array(dim),
      i, j;

    for (i=0; i<dim; ++i) {
      a[i] = new Array(dim);

      for (j=0; j<dim; ++j) {
        a[i][j] = 0;
      }

      a[i][i] = entry;
    }

    return new Matrix(a);
  };




  /**
   * Create a matrix of zeros.
   * @param {Integer} rows Number of rows.
   * @param {Integer} bols Number of bols.
   * @return {Matrix}
   */
  Matrix.zeros = function(rows, cols) {
    var a = new Array(rows);

    for (var i=0; i<rows; ++i) {
      a[i] = []
      for (var j=0; j<cols; ++j) {
        a[i][j] = 0;
      }
    }
    return new Matrix(a);
  };




  /**
   * Reshape a matrix.
   * @param {Array} values 1D array (vector)
   * @param {Number} rows Number of rows.
   * @param {Number} cols Number of cols.
   * @return {Matrix}
   */
  Matrix.reshape = function(values, rows, cols) {
    var a = [];

    if (values.length !== rows * cols) {
      _throwError('value length is ' + values.length + ' and rows x cols is ' + rows * cols);
    }

    if (rows * cols === values.length) {
      for (var i=0; i<values.length; i += cols) {
        a.push(values.slice(i, cols + i));
      }
    }
    return new Matrix(a);
  };




  /**
   * Helpers to create vectors, i.e. matrices with a single row.
   */
  var Vector = LinAlg.Vector = {
    /**
     * Create a row-vector of zeros.
     * @param  {Integer} size Length of vector.
     * @return {Vector}
     */
    zero: function(size) {
      var a = new Array(size);

      for (var i=0; i<size; ++i) {
        a[i] = 0;
      }

      return new Matrix(a);    
    }
  };



/**
 * @fileOverview  Initialization options
 */


// function to add floating point values
if (options.add) {
  console.warn('linear-algebra: adder (options.add) will not be used in non-precision version');
}

/**
 * @fileOverview  Basic arithmetic operations
 */




/**
 * Transpose this matrix.
 * @return {Matrix}
 */
Matrix.prototype.trans = function() {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols;

  var row, col;

  var result = new Array(cols);

  for (col=0; col<cols; ++col) {
    result[col] = new Array(rows);
    
    for (row=0; row<rows; ++row) {
      result[col][row] = thisData[row][col];
    }
  }

  return new Matrix(result);
};






/**
 * In-place version of trans().
 * @return this
 */
Matrix.prototype.trans_ = function() {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols;

  var row, col, t;

  // first we transpose the matrix upto length of shortest side
  var isSquare = (cols === rows);
  var shortestSide = (cols > rows) ? rows : cols;

  for (row=0; row<shortestSide; ++row) {
    for (col=row + 1; col<shortestSide; ++col) {
      t = thisData[col][row];
      thisData[col][row] = thisData[row][col];
      thisData[row][col] = t;
    }
  }

  // now we transpose the rest of the matrix
  if (!isSquare) {
    if (cols > rows) {
      // do a column at a time
      for (col=rows; cols > col; ++col) {
        if (!Array.isArray(thisData[col])) {
          thisData[col] = new Array(rows);
        }

        for (row=0; row<rows; ++row) {
          thisData[col][row] = thisData[row][col];
        }
      }
    }
    else {
      // do a row at a time
      for (row=cols; rows > row; ++row) {
        for (col=0; cols > col; ++col) {
          thisData[col][row] = thisData[row][col];
        }
      }
    }
    
    // finally, we update the "official" dimensions
    t = rows;
    this.rows = cols;
    this.cols = t;
  }


  return this;
};



Matrix.prototype.div = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('div', this, op2);
  }
  
  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);
    
    for (col=0; col<cols; ++col) {
      result[row][col] = thisData[row][col] / op2Data[row][col];
    }
  }

  return new Matrix(result);
};




Matrix.prototype.div_ = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('div_', this, op2);
  }
  
  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = thisData[row][col] / op2Data[row][col];
    }
  }

  return this;
};




Matrix.prototype.mul = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('mul', this, op2);
  }
  
  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);
    
    for (col=0; col<cols; ++col) {
      result[row][col] = thisData[row][col] * op2Data[row][col];
    }
  }

  return new Matrix(result);
};




Matrix.prototype.mul_ = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('mul_', this, op2);
  }
  
  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = thisData[row][col] * op2Data[row][col];
    }
  }

  return this;
};




Matrix.prototype.plus = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('plus', this, op2);
  }
  
  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);
    
    for (col=0; col<cols; ++col) {
      result[row][col] = thisData[row][col] + op2Data[row][col];
    }
  }

  return new Matrix(result);
};




Matrix.prototype.plus_ = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('plus_', this, op2);
  }
  
  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = thisData[row][col] + op2Data[row][col];
    }
  }

  return this;
};




Matrix.prototype.minus = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('minus', this, op2);
  }
  
  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);
    
    for (col=0; col<cols; ++col) {
      result[row][col] = thisData[row][col] - op2Data[row][col];
    }
  }

  return new Matrix(result);
};




Matrix.prototype.minus_ = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (rows !== rows2 || cols !== cols2) {
    _throwSizeMismatchError('minus_', this, op2);
  }
  
  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = thisData[row][col] - op2Data[row][col];
    }
  }

  return this;
};











/**
 * Dot product.
 * 
 * @param  {Matrix} arg A Matrix.
 * 
 * @return {Matrix}
 */
Matrix.prototype.dot = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (cols !== rows2) {
    _throwSizeMismatchError('dot', this, op2);
  }

  // op1 = m x n
  // op2 = m2 x n2
  // op1 * op2 => m x n2

  var row, row2, col2;

  var result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols2);

    for (col2=0; col2<cols2; ++col2) {
      result[row][col2] = 0;

      for (row2=0; row2<rows2; ++row2) {
        result[row][col2] += thisData[row][row2] * op2Data[row2][col2];
      }
    }
  }  

  return new Matrix(result);
};




/**
 * In-place version of dot().
 * 
 * @return this
 */
Matrix.prototype.dot_ = function(op2) {
  var thisData = this.data,
    rows = this.rows, 
    cols = this.cols,
    op2Data = op2.data,
    rows2 = op2.rows,
    cols2 = op2.cols;

  if (cols !== rows2) {
    _throwSizeMismatchError('dot_', this, op2);
  }

  // op1 = m x n
  // op2 = m2 x n2
  // op1 * op2 => m x n2

  var row, row2, col2, tmp;

  for (row=0; row<rows; ++row) {
    // we need to keep a copy of this row since we'll be overwriting it in this.data
    tmp = thisData[row].slice(0, cols);

    for (col2=0; col2<cols2; ++col2) {
      thisData[row][col2] = 0;

      for (row2=0; row2<rows2; ++row2) {
        thisData[row][col2] += tmp[row2] * op2Data[row2][col2];
      }
    }
  }  

  // update dimensions
  this.cols = cols2;

  return this;
};




Matrix.prototype.getSum = function(axis) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var _getSum = function(that) {
    var thisData = that.data,
      rows = that.rows,
      cols = that.cols;

    var arr = new Array(rows);
    for (var i = 0; i<rows; ++i) {
      var sum = 0;
      for (var j = 0; j<cols; ++j) {
        sum += thisData[i][j];
      }
      arr[i] = sum;
    }
    return arr;
  };

  if (axis === 0) {
    return _getSum(this.trans());
  } else if (axis === 1) {
    return _getSum(this);
  } else if (axis === null || axis === undefined) {
    var sum = 0;
    for (var i = 0; i<rows; ++i) {
      for (var j = 0; j<cols; ++j) {
        sum += thisData[i][j];
      }
    }
    return sum;
  } else {
    _throwError('[getSum] axis is ' + axis);
  }
};


Matrix.prototype.getNorm = function() {
 var thisData = this.data,
   rows = this.rows,
   cols = this.cols;

 var nnorm = 0;

 for (var i = 0; i<rows; ++i) {
   for (var j = 0; j<cols; ++j) {
     nnorm += Math.pow(Math.abs(thisData[i][j]), 2);
   }
 }
 
 return Math.sqrt(nnorm);
};

Matrix.prototype.getMean = function() {
  return this.getSum() / (this.rows * this.cols);
};

/**
 * Apply function to all elements in this matrix.
 *
 * @param {Function} transformFn With signature (double) => double
 */
Matrix.prototype.map = function(transformFn) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = transformFn(thisData[row][col]);
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.map_ = function(transformFn) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = transformFn(thisData[row][col]);
    }
  }  

  return this;
};






/**
 * Calculate the natural log (ln) all the elements.
 */
Matrix.prototype.log = function(undefined) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = Math.log(thisData[row][col]);
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.log_ = function(undefined) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = Math.log(thisData[row][col]);
    }
  }  

  return this;
};






/**
 * Calculate the sigmoid function of all the elements.
 *
 * See http://en.wikipedia.org/wiki/Sigmoid_function
 */
Matrix.prototype.sigmoid = function(undefined) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = (1 / (1 + Math.exp(-thisData[row][col])));
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.sigmoid_ = function(undefined) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = (1 / (1 + Math.exp(-thisData[row][col])));
    }
  }  

  return this;
};





var n2n = function(value) {
  if (isNaN(value)) {
    return 0;
  } else if (value === Number.POSITIVE_INFINITY) {
    return Number.MAX_VALUE;
  } else if (value === Number.NEGATIVE_INFINITY) {
    return -Number.MAX_VALUE;
  } else {
    return value;
  }
}

/**
 * Calculate the nanToNum function of all the elements.
 */
Matrix.prototype.nanToNum = function(undefined) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = n2n(thisData[row][col]);
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.nanToNum_ = function(undefined) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = n2n(thisData[row][col]);
    }
  }  

  return this;
};






/**
 * Multiply every element with given value.
 * @param  {Number} value Value to multiple with.
 */
Matrix.prototype.mulEach = function(value) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = thisData[row][col] * value;
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.mulEach_ = function(value) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = thisData[row][col] * value;
    }
  }  

  return this;
};






/**
 * Add a value to every element.
 * @param  {Number} value Value to multiple with.
 */
Matrix.prototype.plusEach = function(value) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = thisData[row][col] + value;
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.plusEach_ = function(value) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = thisData[row][col] + value;
    }
  }  

  return this;
};





/**
 * Apply function with row and column parameters to all elements in matrix
 *
 * Used to apply different transformations depending on placement in matrix.
 */
Matrix.prototype.eleMap = function(transformFn) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col, result = new Array(rows);

  for (row=0; row<rows; ++row) {
    result[row] = new Array(cols);

    for (col=0; col<cols; ++col) {
      result[row][col] = transformFn(thisData[row][col], row, col);
    }
  }  

  return new Matrix(result);
};





Matrix.prototype.eleMap_ = function(transformFn) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var row, col;

  for (row=0; row<rows; ++row) {
    for (col=0; col<cols; ++col) {
      thisData[row][col] = transformFn(thisData[row][col], row, col);
    }
  }  

  return this;
};





/**
 * Get the maximum value of all the elements.
 *
 * @param {Integer} axis
 */
Matrix.prototype.getMax = function(axis) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var _getMax = function(that) {
    var thisData = that.data,
      rows = that.rows,
      cols = that.cols;

    var arr = new Array(rows);
    for (var i = 0; i<rows; ++i) {
      var val = thisData[i][0],
        idx = 0;
      for (var j = 0; j<cols; ++j) {
        if (thisData[i][j] > val) {
          val = thisData[i][j];
          idx = j;
        }
      }
      arr[i] = val;
    }
    return arr;
  }

  if (axis === 0) {
    return _getMax(this.trans());
  } else if (axis === 1) {
    return _getMax(this);
  } else if (axis === null || axis === undefined) {
    var val = thisData[0][0],
      idx = 0;
    for (var i = 0; i<rows; ++i) {
      for (var j = 0; j<cols; ++j) {
        if (thisData[i][j] > val) {
          val = thisData[i][j];
          idx = cols * i + j
        }
      }
    }
    return val;
  } else {
    _throwError('[getMax] axis is ' + axis);
  }
};


/**
 * Get the mininum value of all the elements.
 *
 * @param {Integer} axis
 */
Matrix.prototype.getMin = function(axis) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var _getMin = function(that) {
    var thisData = that.data,
      rows = that.rows,
      cols = that.cols;

    var arr = new Array(rows);
    for (var i = 0; i<rows; ++i) {
      var val = thisData[i][0],
        idx = 0;
      for (var j = 0; j<cols; ++j) {
        if (thisData[i][j] < val) {
          val = thisData[i][j];
          idx = j;
        }
      }
      arr[i] = val;
    }
    return arr;
  }

  if (axis === 0) {
    return _getMin(this.trans());
  } else if (axis === 1) {
    return _getMin(this);
  } else if (axis === null || axis === undefined) {
    var val = thisData[0][0],
      idx = 0;
    for (var i = 0; i<rows; ++i) {
      for (var j = 0; j<cols; ++j) {
        if (thisData[i][j] < val) {
          val = thisData[i][j];
          idx = cols * i + j
        }
      }
    }
    return val;
  } else {
    _throwError('[getMin] axis is ' + axis);
  }
};


/**
 * Get the argument of maximum value of all the elements.
 *
 * @param {Integer} axis
 */
Matrix.prototype.getArgMax = function(axis) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var _getArgMax = function(that) {
    var thisData = that.data,
      rows = that.rows,
      cols = that.cols;

    var arr = new Array(rows);
    for (var i = 0; i<rows; ++i) {
      var val = thisData[i][0],
        idx = 0;
      for (var j = 0; j<cols; ++j) {
        if (thisData[i][j] > val) {
          val = thisData[i][j];
          idx = j;
        }
      }
      arr[i] = idx;
    }
    return arr;
  }

  if (axis === 0) {
    return _getArgMax(this.trans());
  } else if (axis === 1) {
    return _getArgMax(this);
  } else if (axis === null || axis === undefined) {
    var val = thisData[0][0],
      idx = 0;
    for (var i = 0; i<rows; ++i) {
      for (var j = 0; j<cols; ++j) {
        if (thisData[i][j] > val) {
          val = thisData[i][j];
          idx = cols * i + j
        }
      }
    }
    return idx;
  } else {
    _throwError('[getArgMax] axis is ' + axis);
  }
};


/**
 * Get the argument of minimum value of all the elements.
 *
 * @param {Integer} axis
 */
Matrix.prototype.getArgMin = function(axis) {
  var thisData = this.data,
    rows = this.rows,
    cols = this.cols;

  var _getArgMin = function(that) {
    var thisData = that.data,
      rows = that.rows,
      cols = that.cols;

    var arr = new Array(rows);
    for (var i = 0; i<rows; ++i) {
      var val = thisData[i][0],
        idx = 0;
      for (var j = 0; j<cols; ++j) {
        if (thisData[i][j] < val) {
          val = thisData[i][j];
          idx = j;
        }
      }
      arr[i] = idx;
    }
    return arr;
  }

  if (axis === 0) {
    return _getArgMin(this.trans());
  } else if (axis === 1) {
    return _getArgMin(this);
  } else if (axis === null || axis === undefined) {
    var val = thisData[0][0],
      idx = 0;
    for (var i = 0; i<rows; ++i) {
      for (var j = 0; j<cols; ++j) {
        if (thisData[i][j] < val) {
          val = thisData[i][j];
          idx = cols * i + j
        }
      }
    }
    return idx;
  } else {
    _throwError('[getArgMin] axis is ' + axis);
  }
};



    return LinAlg;
  };
});

