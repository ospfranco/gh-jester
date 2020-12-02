export interface Result<M> {
  metadata: M;
  isOkay: boolean;
  text: string;
  shortText: string;
}