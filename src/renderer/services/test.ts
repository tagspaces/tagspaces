export function dataTidFormat(tid: string) {
  if (tid) {
    // The ^ character inside the square brackets means "not"
    return tid.trim().replace(/[^a-zA-Z0-9_-]+/g, '_');
  }
  return '';
}
