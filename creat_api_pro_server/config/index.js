const DataType = {
  ['tinyint']: 'TINYINT',
  ['tinyint(1)']: 'TINYINT',
  ['smallint']: 'SMALLINT',
  ['mediumint']: 'MEDIUMINT',
  ['int']: 'NUMBER',
  ['bigint']: 'BIGINT',
  ['float']: 'FLOAT',
  ['double']: 'DOUBLE',
  ['char']: 'STRING',
  ['varchar']: 'STRING',
  ['text']: 'STRING',
  ['date']: 'DATE',
  ['time']: 'TIME',
  ['datetime']: 'DATE',
  ['timestamp']: 'DATE',
  ['bool']: 'BOOLEAN',
  ['boolean']: 'BOOLEAN',
  ['blob']: 'BLOB'
}

const DataDefaultVal = {
  ['tinyint']: 0,
  ['tinyint(1)']: 0,
  ['smallint']: 0,
  ['mediumint']: 0,
  ['int']: 0,
  ['bigint']: 0,
  ['float']: 0.0,
  ['double']: 0.0,
  ['char']: `''`,
  ['varchar']: `''`,
  ['text']: `''`,
  ['date']: `Date.now()`,
  ['time']: `Date.now()`,
  ['datetime']: `Date.now()`,
  ['timestamp']: `null`,
  ['bool']: false,
  ['boolean']: false,
  ['blob']: `null`
}

module.exports = {
  DataType,
  DataDefaultVal
}