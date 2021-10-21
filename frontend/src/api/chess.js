export default function(instance) {
  return {
    load() {
      return instance.get("/api/chess/");
    },
  }
}