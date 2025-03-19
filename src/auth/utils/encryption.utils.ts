import * as bcrypt from 'bcrypt';

export const encryptPasswordWithSalt = (
  password: string,
  salt: string,
): Promise<string> => {
  return new Promise((resolve) => {
    bcrypt.hash(password, salt, function (err, hash) {
      resolve(hash);
    });
  });
};

export const genSalt = (): Promise<string> => {
  return new Promise((resolve) => {
    bcrypt.genSalt(10, function (err, salt) {
      resolve(salt);
    });
  });
};
export const encryptPassword = async (
  password,
): Promise<{ password: string; salt: string }> => {
  const salt = await genSalt();
  const passwordHash = await encryptPasswordWithSalt(password, salt);
  return {
    password: passwordHash,
    salt,
  };
};

export const comparePasswords = async (
  password: string,
  salt: string,
  passwordToCompare: string,
): Promise<boolean> => {
  const hash = await encryptPasswordWithSalt(passwordToCompare, salt);
  return password === hash;
};

export const checkPasswordHistory = async (
  password: string,
  passwordHistory: {
    password: string;
    salt: string;
  }[] = [],
) => {
  try {
    const promises = passwordHistory.map((pass) =>
      comparePasswords(pass.password, pass.salt, password),
    );
    const result = await Promise.all(promises);
    return result.some((isEqual) => isEqual);
  } catch (e) {}
};
