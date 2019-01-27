
//TODO: remove the '?' from the lat and lng, cannot be a marker without location!

/** This is the Marker interface, to use with the AGM
 * Some properties should only be modifiable when an object is first created. 
 * You can specify this by putting readonly before the name of the property.
 * the '?' indicate an optional field
 */
export interface Marker {
    readonly name?: string;
    readonly lat?: number;
    readonly lng?: number;
    readonly description?: string;
    readonly strength?: string;
    readonly date?: Date;
}

/** This is the Subject interface, and Subjects class
 *  This interface represent one element in the mainArray proprtey in Subjects class
 *  We will use this interface and class to save all the data from the server localy
 *  and then use the AGM mechanism integrated with some ngFor
 *  to add the markers to the Google Map efficiently
 */
export interface Subject {
    name: string,
    markers: Marker[]
}


export class Subjects {

    mainArray: Subject[] = [];

    //the '?' indicate an optional argument
    constructor(public subject?: Subject) {
        if(subject !== undefined)
            this.addNewSubject(subject.name, subject.markers);
     }

    create(event: { subject: string, markers: Marker[] }) {
        return { subject: event.subject, markers: event.markers };
    }

    addNewSubject(subject: string, markers: Marker[]) {
        console.log("subject = " + subject);
        // let res = this.checkIfSubjectExisting(subject);
        let index = this.findSubjectInMainArray(subject);
        console.log("index = " + index);
        if (index !== -1) {
            console.log("cannot create new subject, add the new data to the old subject")
            /** This approch is for browsers that supports ECMAScript 6
             * it calls 'spread operator'
             * This would on for arrays size under 100,000 elements, depending on the browser.
             * if the input array is too long we will fail with a stack overflow error.  
             * If we cannot guarantee that the input array is short enough, 
             * we will need to use a standard loop-based technique. 
             */
            // this.mainArray[index].markers.push(...markers);
            // this.mainArray[index].markers.push({name:"hello " + index});
            console.log(this.mainArray[index].markers[0]);
        } else {
            console.log("create a new instance");
            let obj:Subject;
            obj.name = subject;
            obj.markers = [];
            obj.markers.push(markers[0]);
            console.log("obj:")
            console.log(obj)
            // obj = {name:subject, markers:markers}
            // obj.markers = [];
            this.mainArray.push(obj);
            // this.mainArray.push({ name: subject, markers: markers })
        }
    }

    /** return the position of a given subject name in the mainArray
     * @param subject a new subject name to check
     * @returns the index of the first subject name in the array where predicate is true, 
     * otherwise -1
     */
    private findSubjectInMainArray(subject: string): number {
        return this.mainArray.findIndex(element => {
            return (element.name === subject);
        })
    }

    /** This method is deprecated!!!!
     *  check if the new input subject is already exist in the mainArray
     * @param subject a new subject name to check
     * @returns true if the subject is exists, else returns false
     */
    private checkIfSubjectExisting(subject: string): boolean {
        return this.mainArray.some(element => {
            return (element.name === subject)
        });
    }

    toString(): string {
        if (this.mainArray.length === 0)
            return "Empty!";
        let str = "";
        let i = 0;
        this.mainArray.forEach(element => {
            str += "[" + i + "] " + element.name + ":\n";
            if ((element.markers === null)
                || (element.markers === undefined)
                || (element.markers.length === 0))
                str += "No Markers!"
            else
                str += this.printMarkers(element.markers);
            i++
        });
        return str;
    }

    /** Sub method that help the toString() to print the mainArray object
     *  run over all the markers in marker[] and add them to a string
     * @param markers an array of markers to print
     * @returns a string with all the markers information
     */
    private printMarkers(markers: Marker[]): string {
        let str = "";
        markers.forEach(marker => {
            str += marker.name + "; " + marker.lat + " : " + marker.lng + "\n"
                + marker.description + ", " + marker.strength + ", " + marker.date + "\n----------\n";
        });
        return str;
    }
}
