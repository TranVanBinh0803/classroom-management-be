export const normalizePhoneNumber = (phone) => {
  if (phone.startsWith("+84")) {
    return "0" + phone.slice(3);
  }
  return phone;
};