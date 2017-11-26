/* eslint-disable class-methods-use-this */
export default class {
  constructor(nickname, passwordDigest) {
    this.nickname = nickname;
    this.passwordDigest = passwordDigest;
  }
  isGuest() {
    return false;
  }
}
