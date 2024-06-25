export function findMostSimilarWithId(str:any, arr:any) {
  // 计算str与其他元素的相似度，返回一个对象，键为元素，值为相似度
  const similarityScores = arr.map((element:any) => ({
    element,
    similarity: levenshteinDistance(str, element)
  }));

  // 找出相似度最高的元素
  const mostSimilar = similarityScores.reduce((most:any, current:any) => {
    return current.similarity > most.similarity ? current : most;
  }).element;

  // 筛选出含有id的元素
  const elementsWithId = arr.filter((element:any) => element.toLowerCase().includes('id'));

  // 再次计算带有id的元素与str的相似度，找出最接近的带有id的元素
  const closestWithId = elementsWithId.reduce((closest:any, element:any) => {
    const distanceToClosest = levenshteinDistance(str, closest);
    const distanceToCurrent = levenshteinDistance(str, element);
    return distanceToCurrent < distanceToClosest ? element : closest;
  },elementsWithId[0]);

  return closestWithId;
}

// 用于计算两个字符串之间Levenshtein距离的函数（简化版）
function levenshteinDistance(a:any, b:any) {
  if (a.length === 0) return b.length; 
  if (b.length === 0) return a.length;

  const matrix = [];

  // Increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // Substitution
          Math.min(
            matrix[i][j - 1] + 1, // Insertion
            matrix[i - 1][j] + 1 // Deletion
          )
        );
      }
    }
  }
  console.log(matrix[b.length][a.length])
  return matrix[b.length][a.length];
}

const str = '11111province_college_major';
const arr = ['sdfsdfs', 'province_college_majorID', 'user_name_mmid', 'user_name_id', 'user_name_qweID', 'asdasd'];

console.log(findMostSimilarWithId(str, arr));
