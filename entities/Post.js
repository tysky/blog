let classId = 1;

export default class Post {
  constructor(title, body) {
    this.title = title;
    this.body = body;
    this.id = classId; //eslint-disable-line
    classId += 1; //eslint-disable-line
  }
}
